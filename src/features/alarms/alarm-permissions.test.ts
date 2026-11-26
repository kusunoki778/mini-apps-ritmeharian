import { beforeEach, describe, expect, it, vi } from 'vitest';

const holder = vi.hoisted(() => ({
  native: true,
  fullSupported: true,
  display: 'granted' as 'granted' | 'denied',
  exact: 'granted' as 'granted' | 'denied',
  fullScreen: true,
  requested: 0,
  exactOpened: 0,
  fullScreenOpened: 0,
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => holder.native },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: async () => ({ display: holder.display }),
    requestPermissions: async () => {
      holder.requested += 1;
      holder.display = 'granted';
      return { display: holder.display };
    },
    checkExactNotificationSetting: async () => ({ exact_alarm: holder.exact }),
    changeExactNotificationSetting: async () => {
      holder.exactOpened += 1;
      holder.exact = 'granted';
    },
  },
}));

vi.mock('./native-alarm', () => ({
  fullAlarmSupported: () => holder.fullSupported,
  fullAlarm: () => ({
    canUseFullScreenIntent: async () => ({ granted: holder.fullScreen }),
    openFullScreenIntentSettings: async () => {
      holder.fullScreenOpened += 1;
      holder.fullScreen = true;
    },
  }),
}));

import {
  alarmPermissionState,
  alarmPermissionsComplete,
  alarmPermissionsSupported,
  ensureAlarmPermissions,
} from './alarm-permissions';

beforeEach(() => {
  holder.native = true;
  holder.fullSupported = true;
  holder.display = 'granted';
  holder.exact = 'granted';
  holder.fullScreen = true;
  holder.requested = 0;
  holder.exactOpened = 0;
  holder.fullScreenOpened = 0;
});

describe('alarmPermissionsSupported', () => {
  it('benar hanya di platform native', () => {
    expect(alarmPermissionsSupported()).toBe(true);
    holder.native = false;
    expect(alarmPermissionsSupported()).toBe(false);
  });
});

describe('alarmPermissionState', () => {
  it('melaporkan izin yang kurang tanpa memicu dialog atau pengaturan', async () => {
    holder.display = 'denied';
    holder.exact = 'denied';
    holder.fullScreen = false;

    const state = await alarmPermissionState();

    expect(state).toEqual({ notifications: false, exactAlarm: false, fullScreen: false });
    expect(holder.requested).toBe(0);
    expect(holder.exactOpened).toBe(0);
    expect(holder.fullScreenOpened).toBe(0);
  });

  it('menganggap izin layar penuh penuh saat plugin tidak tersedia', async () => {
    holder.fullSupported = false;
    expect((await alarmPermissionState()).fullScreen).toBe(true);
  });
});

describe('ensureAlarmPermissions', () => {
  it('meminta notifikasi serta membuka pengaturan alarm pasti dan layar penuh', async () => {
    holder.display = 'denied';
    holder.exact = 'denied';
    holder.fullScreen = false;

    const state = await ensureAlarmPermissions();

    expect(holder.requested).toBe(1);
    expect(holder.exactOpened).toBe(1);
    expect(holder.fullScreenOpened).toBe(1);
    expect(alarmPermissionsComplete(state)).toBe(true);
  });

  it('tidak membuka pengaturan bila izin sudah ada', async () => {
    const state = await ensureAlarmPermissions();

    expect(holder.exactOpened).toBe(0);
    expect(holder.fullScreenOpened).toBe(0);
    expect(alarmPermissionsComplete(state)).toBe(true);
  });
});
