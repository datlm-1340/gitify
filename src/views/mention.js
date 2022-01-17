const mention = (body, repository, user) => {
  return {
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'mention_modal',
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Setting mention',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'section',
          block_id: 'users_select',
          text: {
            type: 'mrkdwn',
            text: 'Select user to mention',
          },
          accessory: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true,
            },
            initial_users: user.mention,
            action_id: 'mention_ids',
          },
        },
        {
          type: 'section',
          block_id: 'repository_select',
          text: {
            type: 'plain_text',
            text: 'Repository',
          },
          accessory: {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select an item',
              emoji: true,
            },
            initial_option: {
              text: {
                type: 'plain_text',
                text: repository.id,
              },
              value: repository.channel,
            },
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: repository.id,
                },
                value: repository.channel,
              },
            ],
            action_id: 'repository',
          },
        },
      ],
    },
  };
};

module.exports = mention;
