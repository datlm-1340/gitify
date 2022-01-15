const setup = (body) => {
  return {
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'setup_modal',
      title: {
        type: 'plain_text',
        text: 'Setup',
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
          block_id: 'repository_input',
          type: 'input',
          element: {
            type: 'plain_text_input',
            action_id: 'repository',
            placeholder: {
              type: 'plain_text',
              text: 'organization/repository',
              emoji: true,
            },
          },
          label: {
            type: 'plain_text',
            text: 'GitHub repository',
            emoji: true,
          },
        },
        {
          block_id: 'notification_channel_select',
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Select where Gitify gets notifications from GitHub*',
          },
          accessory: {
            type: 'conversations_select',
            action_id: 'notification_channel',
            placeholder: {
              type: 'plain_text',
              text: 'Select a channel',
              emoji: true,
            },
          },
        },
        {
          block_id: 'channel_select',
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Select the DEV channel*',
          },
          accessory: {
            type: 'conversations_select',
            action_id: 'channel',
            placeholder: {
              type: 'plain_text',
              text: 'Select a channel',
              emoji: true,
            },
          },
        },
      ],
    },
  };
};

module.exports = setup;
