const settingUsers = (body, userIds, githubIds, repository) => {
  return {
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'users_modal',
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Add users',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'input',
          block_id: 'users_select',
          element: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true,
            },
            initial_users: userIds,
            action_id: 'slack_ids',
          },
          label: {
            type: 'plain_text',
            text: 'Users',
            emoji: true,
          },
        },
        {
          type: 'input',
          block_id: 'github_id_input',
          type: 'input',
          element: {
            type: 'plain_text_input',
            multiline: true,
            action_id: 'github_ids',
            initial_value: githubIds.join('\n'),
            placeholder: {
              type: 'plain_text',
              text: "A user's GitHub ID per line",
            },
          },
          label: {
            type: 'plain_text',
            text: 'GitHub IDs',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '_Input GitHub ID in the order of selected users_',
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

module.exports = settingUsers;
