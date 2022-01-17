const Repository = require('../models/Repository');
class SettingService {
  constructor(app) {
    this.app = app;
  }

  setup = async (params) => {
    let formData = {
      id: params['repository_input']['repository'].value,
      channel: params['channel_select']['channel'].selected_conversation,
      notificationChannel:
        params['notification_channel_select']['notification_channel'].selected_conversation,
    };
    let newRepo = new Repository(formData);

    await newRepo.save();
  };

  addUser = async (params) => {
    const repository = await Repository.findOne({
      channel: params['repository_select']['repository'].selected_option.value,
    }).exec();
    const formData = {
      slackIds: params['users_select']['slack_ids'].selected_users,
      githubIds: params['github_id_input']['github_ids'].value.split('\n'),
    };
    const users = formData.slackIds.map((slackId, index) => {
      return { slackId, githubId: formData.githubIds[index] };
    });
    const currentUsers = repository.users;
    const currentSlackIds = currentUsers.map((user) => user.slackId);

    if (currentSlackIds.some((x) => !formData.slackIds.includes(x))) {
      await Repository.updateOne(
        { id: repository.id },
        {
          $set: {
            users: currentUsers.filter((user) => formData.slackIds.includes(user.slackId)),
          },
        },
      );
    }

    for (const user of users) {
      let { slackId, githubId } = user;
      user.mention = [];

      if (currentUsers.some((user) => user.slackId === slackId && user.githubId === githubId))
        continue;

      if (!currentUsers.some((user) => user.slackId === slackId)) {
        await Repository.updateOne(
          { repository: repository.id, 'users.slackId': { $ne: user.slackId } },
          { $addToSet: { users: user } },
        );
      }
    }
  };

  mention = async (params, currentUserId) => {
    const repository = await Repository.findOne({
      channel: params['repository_select']['repository'].selected_option.value,
    }).exec();

    await Repository.updateOne(
      { id: repository.id, 'users.slackId': { $eq: currentUserId } },
      { $set: { 'users.$.mention': params['users_select']['mention_ids'].selected_users } },
    );
  };
}

module.exports = SettingService;
