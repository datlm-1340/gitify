const mention = (body) => {
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
            action_id: 'multi_users_select-action',
          },
        },
      ],
    },
  };
};

module.exports = mention;
