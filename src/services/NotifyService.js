// fake data
const json = require('../../db.json');
const Repository = require('../models/Repository');
const users = json.repositories[0].users;
const MESSAGE_TYPE = ['open', 'comment', 'approve', 'merge'];

class NotifyService {
  constructor(app) {
    this.app = app;
  }

  notify = async (message, content, repository) => {
    try {
      let result = await this.app.client.chat.postMessage({
        token: process.env.SLACK_USER_TOKEN,
        channel: repository.channel,
        ...content,
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  };

  getUserByGithubID = (context, isMentioned = false) => {
    if (!context) return;

    const githubID = context.match(/\|(.*?)>/)[1];
    const user = users.find((user) => user.github === githubID);

    return user && user.id;
  };

  getPullRequestID = (context) => {
    if (context) return context.match(/pull\/(.)/)[1];
  };

  getThreadTs = (context, repository) => {
    const pullRequest = this.getPullRequestID(context);
    const thread = repository.threads.filter((thread) => {
      return thread.pullRequest == pullRequest;
    })[0];

    return thread && thread.threadTs;
  };

  filter = (message) => {
    const pattern = message.attachments && message.attachments[0].pretext;
    if (!pattern) return;

    if (pattern.includes('Pull request reopened')) {
      return MESSAGE_TYPE[0];
    } else if (pattern.includes('New comment')) {
      return MESSAGE_TYPE[1];
    } else if (pattern.includes('Review approved')) {
      return MESSAGE_TYPE[2];
    } else if (pattern.includes('Pull request merged')) {
      return MESSAGE_TYPE[3];
    }
  };

  forward = async (message, repository) => {
    const messageType = this.filter(message);

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
    const { pretext, ...attachments } = message.attachments[0];

    const content = {
      text:
        `<@${message.user}>\n\n` +
        `:github-open: *New pull request* by ` +
        `<@${this.getUserByGithubID(pretext)}>`,
      attachments: [attachments],
    };

    let result = await this.notify(message, content, repository);
    let thread = {
      threadTs: result.ts,
      pullRequest: this.getPullRequestID(attachments.title),
    };

    await Repository.updateOne({ repository: repository.id }, { $addToSet: { threads: thread } });
  };

  commentNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];

    // if attachment[0].text include a tag ('|@') then mention user accociated with that github account
    const content = {
      thread_ts: this.getThreadTs(attachments.title, repository),
      text:
        `<@${message.user}>\n\n` +
        `:github-commented: *Commented* by ` +
        `<@${this.getUserByGithubID(pretext)}>`,
      attachments: [attachments],
    };

    this.notify(message, content, repository);
  };

  approveNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];

    console.log(message);
    const content = {
      thread_ts: this.getThreadTs(attachments.title_link, repository),
      text:
        `<@${message.user}>\n\n` +
        `:github-approved: *Approved* by ` +
        `<@${this.getUserByGithubID(pretext)}>`,
      attachments: [attachments],
    };

    this.notify(message, content, repository);
  };

  mergeNotify = (message, repository) => {
    const { pretext, ...attachments } = message.attachments[0];

    const content = {
      thread_ts: this.getThreadTs(attachments.title, repository),
      text: `<@${message.user}>\n\n:github-merged: *Merged*`,
      attachments: [attachments],
    };

    this.notify(message, content, repository);
  };

  execute = async (message) => {
    let repository = await Repository.findOne({ notificationChannel: message.channel }).exec();

    if (!repository) return console.log('Invalid repository!');
    if (message.bot_id) this.forward(message, repository);
  };
}

module.exports = NotifyService;
