const {
	SPV_PREFIX, EARTH_CHAINCODE_ID
} = require('../utils/Constants');
const logger = require('../utils/Logger').getLogger('SPV');
const BaseModel = require('./BaseModel');
const Transaction = require('./Transaction');
const SchemaCheker = require('../utils/SchemaChecker');
const getTimeStamp = require('../utils/TimeStamp');
const math = require('mathjs');
/**
 * Vote is used for member to make a choice with a proposal.
 */
class SPV extends BaseModel {
	constructor(stub) {
		super(stub);
		this.prefix = SPV_PREFIX;

	}

	async doCreate(options) {
		this.txID = this.stub.getTxID();
		this.id = options.id;
		this.buildKey(options.id);
		// Object.assign(this, options);
		this.timestamp = getTimeStamp(this.stub);
		this.name = options.name;
		this.role = options.role;
		this.proposals = [];
		logger.info('Create  Record for account:%s', this.txID);
	}

	async getOneSPV(id) {
		const method = 'getOneSPV';
		try {
			logger.enter(method);
			logger.debug(' %s- targetSPV id is %s', method, id);
			const key = await this.buildKey(id);
			logger.debug(' %s- this.key is %s', method, key);
			let model = (await this.stub.getState(this.key)).toString('utf8');
			if(!model){
				throw new Error('Do not have this spv');
			}
			logger.debug(' %s- this model is %j', method, model);
			model = JSON.parse(model);
			logger.debug(' %s- this model is %j', method, model);
			logger.exit(method);
			return this.fromJSON(model);
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			throw e;
		}
	}

  	async addProposalRecord(id) {
  		const method = 'addProposalRecord';
	    try {
			logger.enter(method);
			logger.debug(' %s- target proposal id is %s', method, id);
			logger.debug(' %s- targetSPV id is %j', method, this.id);
			this.proposals.push(id);
			return this.save();
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			throw e;
		}
  	}

  	async addSupportsRecord(Transaction) {
  		const method = 'addProposalRecord';
	    try {
			logger.enter(method);
			logger.debug(' %s- target proposal id is %s', method, this.id);
			logger.debug(' %s- Transaction is %j', method, Transaction);

			this.supports.push(Transaction);
			this.balance = math.add(math.bignumber(this.balance), math.bignumber(Transaction.amount)).toNumber();
			return this.save();
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			throw e;
		}
  	}

  	async useSPVMoney(Transaction) {
  		const method = 'addProposalRecord';
	    try {
			logger.enter(method);
			logger.debug(' %s- target proposal id is %s', method, this.id);
			logger.debug(' %s- Transaction is %j', method, Transaction);
			this.balance = math.subtract(math.bignumber(this.balance), math.bignumber(Transaction.amount)).toNumber();
			return this.save();
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			throw e;
		}
  	}

	async validateOptions(method, options) {
		switch (method) {
		case 'create':
			this.checkCreateOptions(options);
			break;
		default:
		}
	}

	// eslint-disable-next-line no-unused-vars
	async checkPermission(method, options) {
		switch (method) {
		case 'create':
			break;
		default:
			break;
		}
	}

	async checkCreateOptions(options) {
		const fields = [
			{ name: 'id', type: 'string', required: true },
			{ name: 'name', type: 'string', required: false },
			{ name: 'role', type: 'string', required: false },
		];

		SchemaCheker.check(fields, options);
	}

	toJSON() {
		return {
			id:this.id,
			txID: this.stub.getTxID(),
			timestamp: this.timestamp,
			name: this.name,
			role: this.role,
			proposals:this.proposals,
		};
	}
}

module.exports = SPV;
