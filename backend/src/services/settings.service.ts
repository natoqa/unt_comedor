import { prisma } from '../config';

export class SettingsService {
  async get() {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {},
      });
    }
    return settings;
  }

  async update(data: {
    institutionName?: string;
    systemName?: string;
    breakfastStart?: string;
    breakfastEnd?: string;
    lunchStart?: string;
    lunchEnd?: string;
    dinnerStart?: string;
    dinnerEnd?: string;
    diningCapacity?: number;
  }) {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data,
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data,
      });
    }
    return settings;
  }
}
