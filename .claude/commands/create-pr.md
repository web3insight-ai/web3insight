---
description: Create a pull request for the issue provided as argument
allowed-tools: Bash(git:*), Bash(gh:*), Read, Glob, Write, Edit
---

Create a pull request for the current changes $ARGUMENTS.

Follow these steps:

1. Check current git status and branch information
2. if no branch name is provided and we are on the main branch, then create a branch for me based on the change of the code, otherwise working on the current branch
3. Ensure all changes are committed and the branch is ready
4. Review the commit history since branching from main
5. Push the branch to remote if needed
6. Create a PR with:
   - a descriptive title following commit convention
   - analyze all changes to create a comprehensive PR description in the body following the PR template  `.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE.md`
   - create a pr use the --head flag
   - if provide the Linear issue ID, then add the issue ID to the PR title and description
7. Summarize the changes in a clear and straightforward manner for both developers and non-developers. Add this summary as a comment in the Linear issue using the Linear MCP tool.
8. Return the PR URL for easy access

Use the GitHub CLI (`gh`) for all GitHub operations. Follow the project's commit message guidelines when reviewing commits.
