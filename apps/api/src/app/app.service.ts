import { Injectable } from '@nestjs/common';
import { Console } from 'nestjs-console';

@Injectable()
@Console()
export class AppService {}
