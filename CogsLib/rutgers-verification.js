const nodemailer = require('nodemailer');
const sgClient = require('@sendgrid/mail');
const crypto = require('crypto');
class Validator {
	constructor(mysqlHandler, emailinfo, sendgrid = false) {
		if(sendgrid && sendgrid.auth !== null) {
			console.log('Using sendgrid');

			this.client = sgClient;
			this.client.setApiKey(sendgrid);
			this.client.isSendGrid = true;
		}
		else{
			this.client = nodemailer.createTransport(emailinfo);
		}

		this.mysqlHandler;
	}

	generateVerificationCode() {
		return crypto.randomBytes(3).toString('hex').toUpperCase();
	}

	async startVerification(userid, netid) {

		const code = this.generateVerificationCode();

		const results = await this.mysqlHandler.query('SELECT * FROM cogs.verifying WHERE userid = ?', userid);

		// If you want to require one netid to userid, set that as a search param
		const verifiedResults = await this.mysqlHandler.query('SELECT * FROM cogs.verified WHERE userid = ? ', userid);

		// Check if it has verification attempts listed
		if(results.results[0] != null) {
			const tries = results.results[0].tries;
			if(tries <= 5) {
				await this.mysqlHandler.query('UPDATE cogs.verifying SET code = ?, tries = ? WHERE userid = ? ', [code, 10, userid]);
				await this.sendVerification(netid, code);
				return 'sent';
			}
			else {
				return 'failed';
			}
		}

		// If the userid is already in the verification list, return already verified. This should force the bot to set their role to verification, send a message that they already have been verified, and please contact e-board if its an error
		if(verifiedResults.results[0]) {
			return 'already-verified';
		}

		await this.mysqlHandler.query('INSERT INTO cogs.verifying (userid, netid, code) VALUES (?, ? , ?)', [userid, netid, code]);

		await this.sendVerification(netid, code);

		return 'sent';

	}

	async verify(userid, netid, code) {
		// return false if tries >= 5 < 10, ask them to resend. return 'resend';
		// Set tries == 10, so they have another 5 tries.
		// If they surpase that many tries return blocked, and ask them to see a e-board member return 'failed';
		if(code === null) {
			console.log('Failed to use code, invalid code');
		}

		const results = await this.mysqlHandler.query('SELECT * FROM cogs.verifying WHERE userid = ? AND netid = ?', [userid, netid]);

		if(results.results[0]) {

			const fields = results.results[0];


			if(fields.tries) {
				if(fields.tries >= 5 && fields.tries < 10) {
					await this.mysqlHandler.query('UPDATE cogs.verifying SET tries = ? WHERE userid = ?', [code, 10]);
					// Need to resend code, can't keep guessing
					return 'failed-resend';
				}
				else if(fields.tries >= 16) {
					// Total failure, locked out from trying, contact e-board
					return 'failed';
				}


			}

			if(fields.code === code) {
				await this.mysqlHandler.query('DELETE FROM cogs.verifying WHERE userid = ? AND netid = ? AND code = ?', [userid, netid, code]);

				await this.mysqlHandler.query('INSERT INTO cogs.verified (userid, netid) VALUES (?, ?)', [userid, netid]);

				// Go ahead and give roles
				return 'success';
			}
			else{

				await this.mysqlHandler.query('UPDATE cogs.verifying SET tries = ? WHERE userid = ?',
					[fields.tries + 1, userid]);

				// Wrong code
				return 'invalid';
			}

		}

		return 'failed-no-verification';
	}


	async sendVerification(netid, code) {
		await this.sendMail(this.getEmail(code, netid + '@scarletmail.rutgers.edu'));
	}

	async test() {
		await this.sendMail(this.getEmail(123456, 'sorrer@gmail.com'));
	}

	async sendMail(email) {
		if(this.client.isSendGrid === true) {
			try{
				await this.client.send(email);
			}
			catch (e) {
				console.error(e);

				if(e.response) {
					console.error(e.response.body);
				}
			}
		}
	}


	getEmail(code, to) {
		return {
			from: 'rutgerscogs@gmail.com',
			to: to,
			subject: 'COGS - Discord Verification',
			text:  'Your code is ' + code,
			html: this.getVerificationEmailBody(code)
		};
	}


	getVerificationEmailBody(code) {
		return '<p>Please reply to the bot with this verification code:</p></br><p style ="background-color: ##e1e1e1; font-size: 24; color: black; weight: 700;">' + code + '</p></br><p>If any problems occur, please contact the e-board on the Rutgers COGS server</p>';
	}
}

module.exports = Validator;
