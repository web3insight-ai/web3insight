import { Injectable } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';

@Injectable()
export class BigQueryService {
  public readonly bigquery: BigQuery;

  constructor() {
    this.bigquery = new BigQuery({
      projectId: 'spring-z',
      keyFilename: './service-account-key.json',
    });
  }

  async query<T>(sqlQuery: string): Promise<T[]> {
    const [rows] = await this.bigquery.query({
      query: sqlQuery,
    });
    return rows as T[];
  }
}
