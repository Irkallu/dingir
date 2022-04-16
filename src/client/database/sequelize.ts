import {Sequelize} from 'sequelize-typescript';

import { ServerConfig } from '../models/ServerConfig';
import { UserProfile } from '../models/UserProfile';

export const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'data/dingir.sqlite',
	models: [ ServerConfig, UserProfile ]
});