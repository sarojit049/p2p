# 18_GIT_WORKFLOW.md

# PrivateConnect Git Workflow

Version: 1.0

Status: Approved

Priority: Critical

---

# 1. Purpose

This document defines the official Git workflow for the PrivateConnect project.

Every code change must follow these rules.

---

# 2. Repository

Repository Name
PrivateConnect

Default Branch
main

---

# 3. Branch Strategy

## main
Production-ready code only.
Never develop directly on this branch.

---

## develop
Primary development branch.
All completed features are merged here first.

---

## feature/*
Used for new features.

Examples
feature/authentication
feature/chat
feature/video-call
feature/admin-dashboard

---

## fix/*
Used for bug fixes.

Examples
fix/socket-reconnect
fix/login-validation

---

## hotfix/*
Used only for production-critical issues.

---

# 4. Development Flow

Create feature branch
↓
Implement feature
↓
Test feature
↓
Update documentation
↓
Commit
↓
Merge into develop
↓
Regression testing
↓
Merge into main
↓
Create release

---

# 5. Commit Message Convention

Format
```text
type(scope): short description
```

Examples
```text
feat(auth): implement secret code login
feat(chat): add real-time messaging
feat(call): implement video calling

fix(auth): validate secret code
fix(chat): correct message ordering

refactor(api): simplify auth service

docs(api): update endpoint documentation

test(chat): add integration tests

chore(deps): update packages
```

---

# 6. Allowed Commit Types

* feat
* fix
* refactor
* docs
* test
* chore
* style
* perf

---

# 7. Pull Request Rules

Before creating a PR:
* Code builds successfully.
* Tests pass.
* Documentation updated.
* No secrets committed.
* No console errors.
* Feature matches specification.

---

# 8. Merge Rules

Merge only after:
* Review completed.
* Tests passed.
* Documentation reviewed.

Do not merge incomplete work.

---

# 9. Tags

Version format
```text
v1.0.0
v1.0.1
v1.1.0
v2.0.0
```

---

# 10. Release Process

1. Merge into main.
2. Create Git tag.
3. Deploy backend.
4. Deploy frontend.
5. Run smoke tests.
6. Publish release notes.

---

# 11. Rollback Strategy

If release fails:
* Revert to previous stable tag.
* Restore deployment.
* Investigate issue.
* Fix on new branch.
* Redeploy.

---

# 12. Branch Protection

Protect:
* main

Recommended protections:
* No force push.
* Require review before merge.
* Require passing tests (when CI is added).

---

# 13. Documentation Rule

Every merged feature must update:
* CHANGELOG.md
* PROJECT_PROGRESS.md
* TODO.md (if needed)
* Relevant technical documents

---

# 14. AI Workflow

Before coding:
* Read AI_MEMORY.md
* Read PROJECT_RULES.md
* Read PROJECT_PROGRESS.md
* Read TODO.md

After coding:
* Summarize implementation.
* List changed files.
* Update documentation.
* Suggest next task.

---

# 15. Definition of Done

Git workflow is correctly followed when:
* Branches are organized.
* Commits are meaningful.
* Documentation stays synchronized.
* Releases are versioned.
* Rollbacks are possible.

Status: Approved
Version: 1.0
