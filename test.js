const {
  Client,
  Hbar,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

async function Test(string1) {
return new Promise(async (resolve, reject) => {
  try {
    let client;

    async function scriptHcsTopic() {
      const operatorIdStr = "0.0.4773425";
      const operatorKeyStr = "3030020100300706052b8104000a0422042084df1a882ff2e87e12ea9ef33874a44c7cb2753205168284919c89902c2d24d8";
      
      const operatorId = AccountId.fromString(operatorIdStr);
      const operatorKey = PrivateKey.fromStringECDSA(operatorKeyStr);
      client = Client.forTestnet().setOperator(operatorId, operatorKey);
      
      client.setDefaultMaxTransactionFee(new Hbar(100));
      client.setDefaultMaxQueryPayment(new Hbar(50));
      
      const topicCreateTx = await new TopicCreateTransaction()
        .setTopicMemo(`AirSoul Hedera service`)
        .freezeWith(client);

      const topicCreateTxSigned = await topicCreateTx.sign(operatorKey);
      const topicCreateTxSubmitted = await topicCreateTxSigned.execute(client);
      const topicCreateTxReceipt = await topicCreateTxSubmitted.getReceipt(client);
      const topicId = topicCreateTxReceipt.topicId;
      
      const topicMsgSubmitTx = await new TopicMessageSubmitTransaction()
        .setTransactionMemo(`AirSoul Hedera service topic message`)
        .setTopicId(topicId)
        .setMessage(string1)
        .freezeWith(client);

      const topicMsgSubmitTxSigned = await topicMsgSubmitTx.sign(operatorKey);
      const topicMsgSubmitTxSubmitted = await topicMsgSubmitTxSigned.execute(client);
      const topicMsgSubmitTxReceipt = await topicMsgSubmitTxSubmitted.getReceipt(client);

      const topicMsgSeqNum = topicMsgSubmitTxReceipt.topicSequenceNumber;

      // Wait for data to propagate (simulate async data with timeout)
      await new Promise((resolve) => setTimeout(resolve, 10000)); // simulate a 10-second delay

      const topicVerifyMirrorNodeApiUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId.toString()}/messages?encoding=base64&limit=5&order=asc&sequencenumber=1`;
      const topicVerifyFetch = await fetch(topicVerifyMirrorNodeApiUrl);
      const topicVerifyJson = await topicVerifyFetch.json();
      const topicVerifyMessages = topicVerifyJson?.messages;

      client.close();

      resolve(topicVerifyMessages); // Resolve the data when done
    }

    await scriptHcsTopic();
  } catch (err) {
    console.error('Error in Test function:', err);
    reject(err);
  }
});
}

module.exports = { Test };
