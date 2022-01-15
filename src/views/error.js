const error = (text) => {
  return {
    response_action: 'update',
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Error',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':fire: *Something has gone ~terribly~ wrong!*',
          },
        },
      ],
    },
  };
};

module.exports = error;
