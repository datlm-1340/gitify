// dependencies
require('dotenv').config();
const { App } = require('@slack/bolt');
const _ = require('lodash');
// database
const mongoose = require('mongoose');
const url = require('./src/config/database');
// services
const NotifyService = require('./src/services/NotifyService');
const SettingService = require('./src/services/SettingService');
// models
const Repository = require('./src/models/Repository');
// views
const success = require('./src/views/success');
const error = require('./src/views/error');
const setup = require('./src/views/setup');
const mention = require('./src/views/mention');
const settingUsers = require('./src/views/users');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  port: process.env.PORT || 3000,
});

const notifyService = new NotifyService(app);
const settingService = new SettingService(app);

app.event('app_mention', async ({ event, client }) => {
  if (!event.thread_ts) return;

  let text = '';

  if (/remind|notify|ready/.test(event.text.toLowerCase())) {
    const repository = await Repository.findOne({ channel: event.channel }).exec();
    const thread = _.find(repository.threads, (thread) => thread.threadTs === event.thread_ts);
    const mentionIds = _.map(
      _.find(repository.users, (user) => user.slackId === thread.author).mention,
      (id) => `<@${id}>`,
    ).join(' ');

    text =
      mentionIds +
      `\n\nPlease review this PR: \n\nhttps://github.com/${repository.id}/pull/${thread.pullRequest}`;
  } else {
    text = 'Tớ chỉ hiểu lệnh `remind`, `notify` hoặc `ready` thôi bạn êi!';
  }

  await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.thread_ts,
    text,
  });
});

app.message(async ({ message, say }) => {
  notifyService.execute(message);
});

app.command('/users', async ({ ack, body, client, logger }) => {
  await ack();
  const repository = await Repository.findOne({ channel: body.channel_id }).exec();
  const users = repository.users;
  const userIds = users.map((user) => user.slackId);
  const githubIds = users.map((user) => user.githubId);

  try {
    await client.views.open(settingUsers(body, userIds, githubIds, repository));
  } catch (error) {
    logger.error(error);
  }
});

app.command('/mention', async ({ ack, body, client, logger }) => {
  await ack();
  const repository = await Repository.findOne({ channel: body.channel_id }).exec();
  const user = _.find(repository.users, (user) => user.slackId === body.user_id);

  try {
    await client.views.open(mention(body, repository, user));
  } catch (error) {
    logger.error(error);
  }
});

app.command('/setup', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    await client.views.open(setup(body));
  } catch (error) {
    console.error(error);
  }
});

app.view('setup_modal', async ({ ack, body, view, client, logger }) => {
  try {
    settingService.setup(view.state.values);
    await ack(success());
  } catch (e) {
    await ack(error());
    console.error(e);
  }
});

app.view('users_modal', async ({ ack, body, view, client, logger }) => {
  try {
    settingService.settingUsers(view.state.values);
    await ack(success());
  } catch (e) {
    await ack(error());
    console.error(e);
  }
});

app.view('mention_modal', async ({ ack, body, view, client, logger }) => {
  try {
    settingService.mention(view.state.values, body.user.id);
    await ack(success());
  } catch (e) {
    await ack(error());
    console.error(e);
  }
});

(async () => {
  try {
    await app.start();
    console.log('Bot is running!');

    mongoose.connect(url, { useNewUrlParser: true });
    console.log('MongoDB is connected!');
  } catch (e) {
    console.error(e);
  }
})();
