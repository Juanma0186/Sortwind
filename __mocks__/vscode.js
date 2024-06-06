const { defaultOrder } = require("../src/classes");

module.exports = {
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn().mockImplementation((key) => {
        if (key === "sortwind.order") {
          return defaultOrder;
        }
        return [];
      }),
    }),
  },
};
