import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError(
        'Not able to create outcome transaction without a valid balance',
      );
    }

    const alreadyIsCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (alreadyIsCategory) {
      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: alreadyIsCategory.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    }

    const newCategory = categoryRepository.create({
      title: category,
    });

    await categoryRepository.save(newCategory);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: newCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
