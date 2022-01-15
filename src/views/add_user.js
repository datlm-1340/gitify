const addUser = (body) => {
  return {
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'add_user_modal',
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Add users',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      blocks: [
        {
          type: 'input',
          element: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true,
            },
            action_id: 'multi_users_select-action',
          },
          label: {
            type: 'plain_text',
            text: 'Users',
            emoji: true,
          },
        },
        {
          type: 'input',
          element: {
            type: 'plain_text_input',
            multiline: true,
            action_id: 'plain_text_input-action',
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
      ],
    },
  };
};

module.exports = addUser;
