// dependencies
require('dotenv').config();
const { App } = require('@slack/bolt');
// database
const mongoose = require('mongoose');
const url = require('./src/config/database');
// services
const NotifyService = require('./src/services/NotifyService');
// models
const Repository = require('./src/models/Repository');
// views
const success = require('./src/views/success');
const error = require('./src/views/error');
const setup = require('./src/views/setup');
const mention = require('./src/views/mention');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
});

const notifyService = new NotifyService(app);

app.event('app_mention', async ({ event }) => {
  console.log('mentioned');
});

app.message(async ({ message, say }) => {
  notifyService.execute(message);
});

app.command('/mention', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    const result = await client.views.open(mention(body));
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.command('/setup', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    await client.views.open(setup(body));
  } catch (error) {
    logger.error(error);
  }
});

app.view('setup_modal', async ({ ack, body, view, client, logger }) => {
  let params = view.state.values;
  let formData = {
    id: params['repository_input']['repository'].value,
    channel: params['channel_select']['channel'].selected_conversation,
    notificationChannel:
      params['notification_channel_select']['notification_channel'].selected_conversation,
  };
  let newRepo = new Repository(formData);

  try {
    newRepo.save();
    await ack(success());
  } catch (e) {
    await ack(error());
  }
});

(async () => {
  try {
    await app.start();
    console.log('Bot is running!');

    mongoose.connect(url, { useNewUrlParser: true });
    console.log('MongoDB is connected!');
  } catch (error) {
    console.log(error);
  }
})();
