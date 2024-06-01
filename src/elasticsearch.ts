import { Client } from '@elastic/elasticsearch';
import { winstonLogger } from '@slasher190/jobber-app';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { Logger } from 'winston';
import { config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SERACH_URL}`, 'notificationElasticSearchServer', 'debug');
export const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SERACH_URL}`
});

export async function checkConnection(): Promise<void> {
  let isConnected: boolean = false;
  while (!isConnected) {
    log.info('AuthService is connecting to Elasticsearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'AuthService checkConnection() method:', error);
    }
  }
}
