# Git Worktree

## Overview

Git worktree memungkinkan Anda memiliki checkout dari branch yang berbeda dalam direktori terpisah pada repository yang sama. Ini sangat berguna untuk:

- Mengerjakan beberapa fitur secara paralel
- Menjalankan AI coding assistant berbeda di branch berbeda
- Menguji branch lain tanpa perlu stash/commit changes
- Hotfix production sambil tetap mengerjakan fitur

## Konsep Dasar

Secara default, repository Git hanya memiliki satu working tree (direktori kerja). Dengan worktree, Anda bisa memiliki:

```
naiera-admin/           ← Main repo (branch: master)
├── .git/
├── apps/
└── ...

naiera-admin-feature/   ← Worktree (branch: feature/task-system)
├── apps/
└── ... (symlink ke .git/main-worktrees)
```

Semua worktree berbagi repository yang sama (`.git`), jadi tidak duplikasi data.

## Perintah Dasar

### Membuat Worktree Baru

```bash
# Buat worktree untuk branch baru
git worktree add ../naiera-admin-feature feature/new-auth

# Buat worktree untuk branch yang sudah ada
git worktree add ../naiera-admin-hotfix hotfix/urgent-fix

# Buat worktree dengan detached HEAD
git worktree add ../naiera-test commit-hash
```

**Format:** `git worktree add <path> <branch-name>`

### Melihat Semua Worktree

```bash
git worktree list
```

Output:
```
/home/acn/code/naiera-admin              9a2b3c4 [master]
/home/acn/code/naiera-admin-feature      7d8e9f0 [feature/new-auth]
/home/acn/code/naiera-admin-hotfix       1a2b3c4 [hotfix/urgent-fix]
```

### Menghapus Worktree

```bash
# Hapus worktree setelah selesai
git worktree remove ../naiera-admin-feature

# Atau hapus directory dulu, lalu prune
rm -rf ../naiera-admin-feature
git worktree prune
```

### Memindahkan Worktree

```bash
git worktree move ../naiera-admin-feature ../naiera-admin-new-feature
```

## Use Cases

### 1. Paralel AI Assistant

```bash
# Main session: Claude Code di master
cd ~/code/naiera-admin

# Gemini session di branch berbeda
git worktree add ../naiera-admin-gemini feature/gemini-task
cd ../naiera-admin-gemini
# Jalankan Gemini CLI di sini
```

### 2. Hotfix Sambil Mengerjakan Fitur

```bash
# Anda sedang mengerjakan fitur di master
cd ~/code/naiera-admin
# ... ada changes uncommitted ...

# Tiba-tiba butuh hotfix
git worktree add ../naiera-admin-hotfix hotfix/urgent-bug
cd ../naiera-admin-hotfix
# Kerjakan hotfix, commit, push
# Kembali ke kerjaan awal tanpa gangguan
```

### 3. Code Review dengan Testing

```bash
# Review PR sambil bisa test di environment terpisah
git worktree add ../naiera-pr-review origin/pr-123
cd ../naiera-pr-review
# Test, modifikasi, commit tanpa affect main branch
```

### 4. Build untuk Environment Berbeda

```bash
# Satu worktree untuk development
cd ~/code/naiera-admin  # master

# Satu worktree untuk production build
git worktree add ../naiera-admin-build production
cd ../naiera-admin-build
pnpm build
# Build tidak terganggu oleh changes di development
```

## Best Practices

### 1. Naming Convention

```bash
# Jelas dan deskriptif
git worktree add ../naiera-admin-feature-auth feature/auth-system
git worktree add ../naiera-admin-hotfix-login hotfix/login-bug
git worktree add ../naiera-admin-experiment experiment/new-ui
```

### 2. Lokasi Konsisten

```bash
# Satu level di atas repo utama
~/code/
├── naiera-admin/          ← Main
├── naiera-admin-auth/     ← Worktree 1
├── naiera-admin-hotfix/   ← Worktree 2
└── naiera-admin-test/     ← Worktree 3
```

### 3. Cleanup Rutin

```bash
# Lihat worktree yang ada
git worktree list

# Hapus yang sudah tidak dipakai
git worktree remove ../naiera-admin-selesai

# Prune untuk membersihkan worktree orphaned
git worktree prune
```

### 4. Jangan Lupa Branch

```bash
# Setelah selesai, merge branch ke main
git checkout master
git merge feature/new-auth
git branch -d feature/new-auth
git worktree remove ../naiera-admin-feature
```

## Troubleshooting

### Worktree Tidak Bisa Dihapus

```bash
# Jika ada uncommitted changes
cd ../naiera-admin-feature
git status
git stash  # atau commit

# Kembali ke main repo dan hapus
cd ~/code/naiera-admin
git worktree remove ../naiera-admin-feature
```

### Directory Worktree Terhapus Manual

```bash
# Jika Anda hapus directory manual
rm -rf ../naiera-admin-feature

# Bersihkan referensi worktree
git worktree prune
```

### Conflict Saat Checkout

```bash
# Git worktree tidak bisa checkout jika file sedang diubah
# Pastikan tidak ada changes di file yang sama
git stash --include-untracked
```

## Tips untuk AI Assistant

### Claude Code + Gemini Paralel

```bash
# Terminal 1: Claude Code
cd ~/code/naiera-admin  # master
claude-code

# Terminal 2: Gemini CLI
cd ~/code/naiera-admin-gemini  # feature branch
gemini-cli
```

**Penting:**
- Pastikan dev server port berbeda (3001 vs 3003)
- Database bisa shared atau terpisah
- Jangan edit file yang sama di dua worktree

### Environment Variables

Setiap worktree memiliki `.env` sendiri:

```bash
# Main worktree
~/code/naiera-admin/.env  # DATABASE_URL=postgres://localhost/dev

# Worktree untuk testing
~/code/naiera-admin-test/.env  # DATABASE_URL=postgres://localhost/test
```

## Perintah Lengkap

| Perintah | Deskripsi |
|----------|-----------|
| `git worktree add <path> <branch>` | Buat worktree baru |
| `git worktree list` | Tampilkan semua worktree |
| `git worktree remove <path>` | Hapus worktree |
| `git worktree move <old> <new>` | Pindahkan worktree |
| `git worktree prune` | Bersihkan worktree orphaned |
| `git worktree lock <path>` | Kunci worktree (tidak bisa dihapus) |
| `git worktree unlock <path>` | Buka kunci worktree |

## Contoh Workflow Lengkap

### Scenario: Mengerjakan 2 Fitur Paralel

```bash
# 1. Mulai di main repo
cd ~/code/naiera-admin
git checkout master
git pull

# 2. Buat worktree untuk fitur 1
git worktree add ../naiera-admin-auth feature/auth-system
cd ../naiera-admin-auth
# Kerjakan fitur auth...

# 3. Butuh kerjakan fitur lain, buat worktree lagi
cd ~/code/naiera-admin
git worktree add ../naiera-admin-email feature/email-system
cd ../naiera-admin-email
# Kerjakan fitur email...

# 4. Selesai fitur auth
cd ../naiera-admin-auth
git add .
git commit -m "feat: add auth system"
git push origin feature/auth-system

# 5. Merge dan cleanup
cd ~/code/naiera-admin
git checkout master
git merge feature/auth-system
git worktree remove ../naiera-admin-auth

# 6. Lanjut kerja fitur email di worktree lain
cd ../naiera-admin-email
# Masih ada progress di sini...
```

## Referensi

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Git Worktree Tutorial](https://github.blog/git-worktree/)
