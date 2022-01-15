const success = (text) => {
  return {
    response_action: 'update',
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Success',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':github-approved: *Everything is awesome!*',
          },
        },
      ],
    },
  };
};

module.exports = success;
