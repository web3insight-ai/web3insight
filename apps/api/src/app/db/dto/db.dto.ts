import {
  ActorScoreRankListDto,
  ActorDateListDto,
  EcoRankListDto,
  RepoRankListDto,
  TotalDto,
} from '@/api/dto/api.dto';
import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [x: string]: JsonValue | undefined;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface DataActors {
  actor_id: Int8;
  actor_login: string | null;
  created_at: Timestamp;
}

export interface ApiUpstreamRepos {
  abnormal: Generated<boolean>;
  api: Generated<Json | null>;
  api_updated_at: Generated<Timestamp | null>;
  created_at: Generated<Timestamp>;
  repo_id: Int8 | null;
  updated_at: Generated<Timestamp>;
  upstream_marks: Generated<Json>;
  upstream_repo_name: string;
}

export interface DataEvent {
  actor_id: Int8;
  actor_login: string;
  body: string | null;
  created_at: Timestamp;
  event_type: string;
  id: Int8;
  org_id: Int8 | null;
  org_login: string | null;
  payload: Generated<Json>;
  public: boolean | null;
  repo_id: Int8 | null;
  repo_name: string | null;
}

export interface APICaches {
  cache_data:
    | Generated<Json | null>
    | TotalDto
    | EcoRankListDto
    | RepoRankListDto
    | ActorScoreRankListDto
    | ActorDateListDto;
  cache_key: string;
  created_at: Timestamp;
  eco_name: Generated<string>;
}

export interface ApiConfigs {
  available: Generated<boolean>;
  body: string;
  id: Generated<Int8>;
  name: string;
}

export interface ApiAnalysisUsers {
  created_at: Generated<Timestamp>;
  data: Generated<Json>;
  github: Generated<Json>;
  id: Generated<Int8>;
  intent: Generated<string>;
  request_data: Generated<Json>;
  submitter_id: Generated<string>;
  description: Generated<string>;
  updated_at: Generated<Timestamp>;
}

export interface DataRepos {
  api_updated_at: Generated<Timestamp>;
  created_at: Generated<Timestamp>;
  custom_marks: Generated<Json>;
  indexed: Generated<boolean>;
  repo_id: Int8;
  repo_name: string;
  upstream_marks: Generated<Json>;
  api: Generated<Json | null>;
}

export interface DB {
  'data.actors': DataActors;
  'data.events': DataEvent;
  'data.repos': DataRepos;
  'api.caches': APICaches;
  'api.configs': ApiConfigs;
  'api.analysis_users': ApiAnalysisUsers;
  'api.upstream_repos': ApiUpstreamRepos;
}
