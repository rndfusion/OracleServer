require('dotenv').config();

const Web3 = require('web3').default;
const theProvider = new Web3.providers.WebsocketProvider(process.env.RPC_URL);
const web3 = new Web3(theProvider);

const crypto = require('crypto');
const elliptic = require('elliptic');
const EC = elliptic.ec;
const ec = new EC('secp256k1');

const private_Key = process.env.PRIVATE_KEY;
const public_key = process.env.PUBLIC_KEY;

const contractAddress = '0xF826A158f7F2587aB901414F57Eb49fc1B45239a';
const contractABI =[
	{
		"inputs": [],
		"name": "AddressNotMSGSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "Filfull",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NoRequest",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotAnOracle",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotEnoughValueForRequest",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotOwnerOfAddress",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "RegisterOracle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "RemoveOracle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "RequestRandomNumber",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_cost",
				"type": "uint256"
			}
		],
		"name": "VoteOnGasPriceMultiplier",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "VoteValueOutOfBounds",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "oracles",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "seed",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gasFunds",
				"type": "uint256"
			}
		],
		"name": "RequestEvent",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "GetGetPriceMultiplier",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "oraclesAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "voteCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "votes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const contract = new web3.eth.Contract(contractABI, contractAddress);

provider = theProvider;
provider.on('error', e => {
	console.error('WS Error', e);
  });
  
  provider.on('end', e => {
	console.log('WS closed');
	console.log('Attempting to reconnect...');
	provider = new Web3.providers.WebsocketProvider(theProvider);
	web3.setProvider(theProvider);
  });
  
console.log('Script started. Listening for events...');

const ethUtil = require('ethereumjs-util');

async function SendTransaction(sig) {
    const account = web3.eth.accounts.privateKeyToAccount(private_Key);
  const nonce = await web3.eth.getTransactionCount(account.address, 'pending');

	var realGasEstimage = 0;

  try {
  const gas2 = await contract.methods
    .Filfull(requestId, sig)
    .estimateGas({ from: account.address, gas: 5000000});
	realGasEstimage = gas2;
	realGasEstimage = gas2 + (gas2 * BigInt(10)) / BigInt(100);   // increases gas2 by 10%

} catch (error) {
	console.error("An error occurred while estimating gas:", error);
  }
	
  const gasPrice = (await web3.eth.getGasPrice());

  const maxEther = gasFunds; // your maximum Ether amount
  
  var gasLimit = maxEther / gasPrice;
 
  //Cap at 10 million gas to not exceed block gas limit
  if(gasLimit > 10000000)
  {
  gasLimit = 10000000;
  }

  const tx = {
  from: account.address,
  to: contractAddress,
  data: contract.methods
	.Filfull(requestId, sig)
	.encodeABI(),
  nonce: nonce,
  gas: gasLimit,
  gasPrice,
  };

  const signedTx = await account.signTransaction(tx);
  web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  .on('transactionHash', hash => {
	console.log('Transaction sent, hash:', hash);
  })
  .on('receipt', receipt => {
	console.log('Transaction receipt:', receipt);
  })
  .on('error', error => {
	  console.error('Error sending transaction:', error);
	  console.log('Error object:', JSON.stringify(error, null, 2));
	});
  }
 
  contract.events.RequestEvent({})
  .on('data', (event) => {
  
      if (event.event === 'RequestEvent') {

		  global.oracles = event.returnValues.oracles;

		  const seed = event.returnValues.seed; 
		
		  global.requestId = event.returnValues.requestId; 

		  global.gasFunds = event.returnValues.gasFunds; 
		  
var oraclesArray = oracles.split("/");
console.log(oraclesArray);
var hasGenerated = false;
for (var i = 0; i < oraclesArray.length; i++) {
	
	if (oraclesArray[i] == (public_key.toLowerCase()))
	{
	
		if(hasGenerated == false)
		{
		GenerateSignature(seed);
		hasGenerated = true;
		}
	}
}
      }
  });

  function GenerateSignature(seed) {
	const privateKeyHex = private_Key;
	
	// Convert the private key to a Buffer
	const privateKey = Buffer.from(privateKeyHex.slice(2), 'hex');
	
	// Get the Ethereum address (public key) from the private key
	const address = ethUtil.bufferToHex(ethUtil.privateToAddress(privateKey));
	
	// Hash the seed (including the length prefix)
	const seedHash = web3.utils.soliditySha3({ t: 'uint256', v: seed });
	const prefixedHash = web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", seedHash);
	
	// Convert message hash back to Buffer
	const messageHashBuffer = Buffer.from(prefixedHash.slice(2), 'hex');
	
	// Sign the messageHash
	const signature = ethUtil.ecsign(messageHashBuffer, privateKey);
	const combinedSignature = Buffer.concat([signature.r, signature.s, Buffer.from([signature.v])]);
	
	console.log('Ethereum Address:', address);
	console.log('Seed:', seed);
	console.log('Signature:', '0x' + combinedSignature.toString('hex'));
  
	const sig = '0x' + combinedSignature.toString('hex');

  SendTransaction(sig);

  }

  


  


