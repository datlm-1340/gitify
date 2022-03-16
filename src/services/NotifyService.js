const _ = require('lodash');
const Repository = require('../models/Repository');
const MESSAGE_TYPE = ['open', 'comment', 'approve', 'merge'];

class NotifyService {
  constructor(app) {
    this.app = app;
  }

  notify = async (message, content, repository) => {
    try {
      let result = await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: repository.channel,
        ...content,
      });

      return result;
    } catch (error) {
      console.error(error);
    }
  };

  getUserByGithubID = (context, users, isMentioned = false) => {
    if (!context) return;

    if (isMentioned) {
      const githubIds = context.match(/[^\|\@]+(?=\>)/g);

      return (
        !_.isEmpty(githubIds) &&
        _.map(
          _.filter(users, (user) => githubIds.includes(user.githubId)),
          (user) => user.slackId,
        )
      );
    }

    const githubId = context.match(/\|(.*?)>/)[1];
    const user = _.find(users, (user) => user.githubId === githubId);

    return user && user.slackId;
  };

  getPullRequestID = (context) => {
    if (!context) return;

    const matches = context.match(/pull\/(\d+)/) || context.match(/\#(\d+)/);

    if (!_.isEmpty(matches)) return matches[1];
  };

  getThread = (context, threads) => {
    const pullRequest = this.getPullRequestID(context);
    const thread = threads.filter((thread) => {
      return thread.pullRequest == pullRequest;
    })[0];

    return thread;
  };

  filter = (message) => {
    const pattern = message.attachments && message.attachments[0].pretext;
    if (!pattern) return;

    if (pattern.includes('opened')) {
      return MESSAGE_TYPE[0];
    } else if (pattern.includes('comment')) {
      return MESSAGE_TYPE[1];
    } else if (pattern.includes('approved')) {
      return MESSAGE_TYPE[2];
    } else if (pattern.includes('merged')) {
      return MESSAGE_TYPE[3];
    }
  };

  forward = async (message, repository) => {
    const messageType = this.filter(message);
    console.log(messageType);
    switch (messageType) {
      case MESSAGE_TYPE[0]:
        this.openNotify(message, repository);
        break;
      case MESSAGE_TYPE[1]:
        this.commentNotify(message, repository);
        break;
      case MESSAGE_TYPE[2]:
        this.approveNotify(message, repository);
        break;
      case MESSAGE_TYPE[3]:
        this.mergeNotify(message, repository);
        break;
      default:
        console.log('Skip');
        break;
    }
  };

  openNotify = async (message, repository) => {
    console.log(message);
    const { pretext, ...attachments } = message.attachments[0];
    const author = this.getUserByGithubID(pretext, repository.users);
    const mentionIds = _.map(
      _.find(repository.users, (user) => user.slackId === author).mention,
      (id) => `<@${id}>`,
    ).join(' ');

    const content = {
      text:
        `${mentionIds}\n\n` +
        `:github-open: *New pull request* by ` +
        `<@${this.getUserByGithubID(pretext, repository.users)}>`,
      attachments: [attachments],
    };

    let result = await this.notify(message, content, repository);
    let thread = {
      author,
      threadTs: result.ts,
      pullRequest: this.getPullRequestID(attachments.title),
    };

    await Repository.updateOne(
      { id: repository.id },
      { $addToSet: { threads: thread } },
      { upsert: true },
    );
  };

  commentNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];
    const thread = this.getThread(attachments.title, repository.threads);

    if (!thread) return;

    console.log(attachments);

    const githubMentions = _.map(
      this.getUserByGithubID(attachments.text, repository.users, true),
      (id) => `<@${id}>`,
    ).join(' ');

    const content = {
      thread_ts: thread.threadTs,
      text:
        `<@${thread.author}> ${githubMentions}\n\n` +
        `:github-commented: *Commented* by ` +
        `<@${this.getUserByGithubID(pretext, repository.users)}>`,
      attachments: [attachments],
    };

    this.notify(message, content, repository);
  };

  approveNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];
    const thread = this.getThread(attachments.title_link, repository.threads);

    if (!thread) return;

    const content = {
      thread_ts: thread.threadTs,
      text:
        `<@${thread.author}>\n\n` +
        `:github-approved: *Approved* by ` +
        `<@${this.getUserByGithubID(pretext, repository.users)}>`,
    };

    this.notify(message, content, repository);
  };

  mergeNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];
    const thread = this.getThread(attachments.title, repository.threads);

    if (!thread) return;

    const content = {
      thread_ts: thread.threadTs,
      text: `<@${thread.author}>\n\n:github-merged: *Merged*`,
    };

    this.notify(message, content, repository);
  };

  execute = async (message) => {
    let repository = await Repository.findOne({ notificationChannel: message.channel }).exec();

    if (!repository) return;

    if (message.bot_id) this.forward(message, repository);
  };
}

module.exports = NotifyService;
