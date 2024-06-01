import { winstonLogger } from '@slasher190/jobber-app';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Sequelize } from 'sequelize';

const log: Logger = winstonLogger(`${config.ELASTIC_SERACH_URL}`, 'authDatabaseServer', 'debug');

export const sequelze: Sequelize = new Sequelize(config.MYSQL_DB!, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function databaseConnection(): Promise<void> {
  try {
    await sequelze.authenticate();
    log.info('AuthService MySql database connection has been establish successfully.');
  } catch (error) {
    log.error('Auth Service - Unable to connect to database.');
    log.log('error', 'Authservice databaseConnection() method error:', error);
  }
}
