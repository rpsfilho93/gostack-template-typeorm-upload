import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne({
      where: {
        id,
      },
    });

    if (transaction) {
      await transactionRepository.remove(transaction);
    } else {
      throw new AppError('This transaction does not exist');
    }
  }
}

export default DeleteTransactionService;
