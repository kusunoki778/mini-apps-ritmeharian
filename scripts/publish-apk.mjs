// Mengunggah APK rilis ke GitHub Releases supaya tombol unduh di web tetap
// berfungsi di hosting statis seperti Vercel. Jalankan setelah build rilis:
//
//   npm run publish:apk
//   npm run publish:apk -- --tag v1.0.1
//
// Tag default diambil dari versionName di android/app/build.gradle. Token dibaca
// dari GITHUB_TOKEN atau GH_TOKEN. Bila tidak ada, dicoba dari kredensial git
// yang tersimpan di mesin ini.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ASSET_NAME = 'Nadi.apk';
const APK_CANDIDATES = [
  'Nadi.apk',
  'android/app/build/outputs/apk/release/app-release.apk',
  'android/app/build/outputs/apk/debug/app-debug.apk',
];

let token = '';

function argValue(name) {
  const exact = process.argv.indexOf(`--${name}`);
  if (exact !== -1 && process.argv[exact + 1]) return process.argv[exact + 1];

  const prefixed = process.argv.find((item) => item.startsWith(`--${name}=`));
  return prefixed ? prefixed.slice(name.length + 3) : null;
}

function findApk() {
  for (const candidate of APK_CANDIDATES) {
    const full = resolve(candidate);
    if (existsSync(full)) return full;
  }
  return null;
}

function repoSlug() {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = /github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/.exec(remote);
  if (!match) throw new Error(`Tidak bisa membaca repo dari remote origin: ${remote}`);
  return `${match[1]}/${match[2]}`;
}

function defaultTag() {
  const gradle = readFileSync('android/app/build.gradle', 'utf8');
  const match = /versionName\s+"([^"]+)"/.exec(gradle);
  if (!match) throw new Error('versionName tidak ditemukan di android/app/build.gradle');

  const parts = match[1].split('.');
  while (parts.length < 3) parts.push('0');
  return `v${parts.slice(0, 3).join('.')}`;
}

function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  const result = spawnSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  });
  const match = /^password=(.+)$/m.exec(result.stdout ?? '');
  return match ? match[1].trim() : '';
}

async function api(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nadi-publish-apk',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  }

  // Beberapa panggilan, seperti DELETE, membalas 204 tanpa badan.
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function ensureRelease(slug, tag) {
  const existing = await api(`/repos/${slug}/releases/tags/${tag}`);
  if (existing) return existing;

  console.log(`Rilis ${tag} belum ada. Membuat rilis baru.`);
  return api(`/repos/${slug}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag_name: tag,
      target_commitish: 'main',
      name: `Nadi ${tag}`,
      body: 'APK rilis bertanda tangan tetap. Unduh Nadi.apk di bawah.',
    }),
  });
}

async function uploadAsset(slug, release, apkPath) {
  const size = statSync(apkPath).size;
  const base = `https://uploads.github.com/repos/${slug}/releases/${release.id}/assets`;

  const response = await fetch(`${base}?name=${ASSET_NAME}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nadi-publish-apk',
      'Content-Type': 'application/vnd.android.package-archive',
    },
    body: readFileSync(apkPath),
  });

  if (!response.ok) {
    throw new Error(`Unggah gagal ${response.status}: ${await response.text()}`);
  }

  const asset = await response.json();
  console.log(`Aset terunggah (${size} byte): ${asset.browser_download_url}`);
}

async function main() {
  const apk = findApk();
  if (!apk) {
    console.error('APK tidak ditemukan. Bangun dulu: gradlew assembleRelease.');
    process.exit(1);
  }

  const slug = repoSlug();
  const tag = argValue('tag') ?? process.env.NADI_RELEASE_TAG ?? defaultTag();

  token = resolveToken();
  if (!token) {
    console.error(
      'Token GitHub tidak ada. Setel GITHUB_TOKEN (skop repo) atau login git yang tersimpan.',
    );
    process.exit(1);
  }

  console.log(`Repo ${slug}, tag ${tag}, berkas ${apk}`);
  const release = await ensureRelease(slug, tag);

  const existing = release.assets.find((asset) => asset.name === ASSET_NAME);
  if (existing) {
    console.log(`Mengganti aset lama ${ASSET_NAME}.`);
    await api(`/repos/${slug}/releases/assets/${existing.id}`, { method: 'DELETE' });
  }

  await uploadAsset(slug, release, apk);
  console.log(`Selesai. Tombol unduh memakai: releases/latest/download/${ASSET_NAME}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
