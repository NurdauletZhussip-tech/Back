const GamificationService = require('../services/gamificationService');
const BadgeModel = require('../models/badgeModel');
const UserBadgeModel = require('../models/userBadgeModel');
const NotificationModel = require('../models/notificationModel');

jest.mock('../models/badgeModel');
jest.mock('../models/userBadgeModel');
jest.mock('../models/notificationModel');

describe('GamificationService', () => {
  beforeEach(() => jest.resetAllMocks());

  test('awards badge when criteria met', async () => {
    BadgeModel.findByCriteria.mockResolvedValue([{ id: 'b1', name: 'Test Badge' }]);
    UserBadgeModel.award.mockResolvedValue(true);
    NotificationModel.create = jest.fn().mockResolvedValue(true);

    await GamificationService.checkAndAwardBadge('child1', 'lessons_completed', 1);

    expect(BadgeModel.findByCriteria).toHaveBeenCalledWith('lessons_completed', 1);
    expect(UserBadgeModel.award).toHaveBeenCalledWith('child1', 'b1');
    expect(NotificationModel.create).toHaveBeenCalled();
  });
});

