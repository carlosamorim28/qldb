console.log('Hello World!');
const AWS = require('aws-sdk');
const https = require('https');
const { QLDBSessionClientConfig } = require('@aws-sdk/client-qldb-session');
const { QldbDriver, RetryConfig } = require('amazon-qldb-driver-nodejs');
const { NodeHttpHandlerOptions } = require('@aws-sdk/node-http-handler');

const awsConfig = {
  region: 'us-west-2',
  accessKeyId: 'AKIA4P45UYFF24UCZZXE',
  secretAccessKey: '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'
}
const maxConcurrentTransactions = 10;
const retryLimit = 4;
const retryConfig = new RetryConfig(retryLimit);
const lowLevelClientHttpOptions = {
  httpAgent: new https.Agent({
    maxSockets: maxConcurrentTransactions
  })
};
const nome_tabela = "Roubados"
const nome_livro_rasao = "Alma"
const qldbDriver = new QldbDriver('AlmanaqueFake', awsConfig, lowLevelClientHttpOptions, maxConcurrentTransactions, retryConfig);
AWS.config.update(awsConfig);

const qldb = new AWS.QLDB({
  apiVersion: '2023-01-30'
});

function createLedger(qldb,ladgerName){
  qldb.createLedger({
      DeletionProtection: false,
      Name: ladgerName,
      PermissionsMode: "STANDARD",
    }).promise().then(()=>{
      console.log("Deu bom criar o lagert", ladgerName)
    }).catch((error)=>{
      console.log("Deu ruim criar por: ", error)
    })
}

function listLedgers(qldb){
  qldb.listLedgers({}, (err, data) => {
    if (err) {
      console.log("Error de batatas ", err.message);
    } else {
      console.log("Success", data.Ledgers);
    }
  });
}

function createTable(qldbDriver, tableName){
  qldbDriver.executeLambda(async (txn)=>{
    txn.execute(`create table ${tableName}`).then(()=>{console.log("Tabela criada")}).catch((err)=>{console.log('Tabela não criada por: ',err)})
  })
}

function insertElementInTabel(qldbDriver,tableName, element){
  qldbDriver.executeLambda(async (txn)=>{
    txn.execute(`insert into ${tableName} ?`,element).then(()=>{console.log("Ganhamo")}).catch((err)=>{console.log('perdemo por: ',err)})
  })  
}

function selectTable(qldbDriver,tableName){
  qldbDriver.executeLambda(async (txn)=>{
    txn.execute(`select * from ${tableName}`).then((data)=>{
      console.log("Ganhamo" )
      const teste = data.getResultList()
      console.log(JSON.stringify(teste, null, 2))
  }).catch((err)=>{console.log('perdemo por: ',err)})
  })
}

function selectTableHistory(qldbDriver,tableName){
  qldbDriver.executeLambda(async (txn)=>{
    txn.execute(`select * from history(${tableName})`).then((data)=>{
      console.log("Ganhamo" )
      const teste = data.getResultList()
      console.log(JSON.stringify(teste, null, 2))
  }).catch((err)=>{console.log('perdemo por: ',err)})
  })
}

function updateTable(qldbDriver,tableName,id,fildName,value){
  qldbDriver.executeLambda(async (txn)=>{
    txn.execute(`UPDATE ${tableName} SET ${fildName} = ? WHERE id = ${id}`, value).then(()=>{console.log("Update concluido")}).catch(()=>{console.log("Não foi utilizado")});
  })
}


selectTableHistory(qldbDriver,nome_tabela)