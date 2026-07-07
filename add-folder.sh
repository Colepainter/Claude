#!/bin/bash

################################################################################
# add-folder.sh - Add a folder from your Desktop (or anywhere) as a skill
# Seedance 2.0 × Higgsfield | Prompt Engineering Skills
#
# 功能说明 | Function Description:
# 此脚本将你桌面（或任意路径）上的文件夹添加到本仓库的 skills/ 目录，
# 并可选择直接安装到 Claude 的技能目录中。
# This script adds a folder from your Desktop (or any path) into this
# repository's skills/ directory, and can optionally install it directly
# into Claude's skills directory.
#
# 用法 | Usage:
#   chmod +x add-folder.sh
#   ./add-folder.sh                        # 交互式：从桌面选择 | Interactive: pick from Desktop
#   ./add-folder.sh ~/Desktop/my-skill     # 添加指定文件夹 | Add a specific folder
#   ./add-folder.sh ~/Desktop/my-skill --install   # 添加并安装到 Claude | Add and install into Claude
#   ./add-folder.sh --help                 # 显示帮助 | Show help
#
# 支持的平台 | Supported Platforms:
#   - macOS (~/Desktop, ~/Library/Application Support/Claude/skills)
#   - Linux  (~/Desktop, ~/.config/Claude/skills)
################################################################################

set -e

# 颜色定义 | Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印函数 | Print functions
print_header() {
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
}

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_item() {
    echo -e "${CYAN}  •${NC} $1"
}

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_REPO_DIR="$REPO_DIR/skills"

# 检测桌面目录 | Detect Desktop directory
detect_desktop_directory() {
    # 优先使用 xdg-user-dir（Linux 上桌面可能被本地化命名）
    # Prefer xdg-user-dir on Linux where Desktop may have a localized name
    if command -v xdg-user-dir >/dev/null 2>&1; then
        DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || true)"
    fi
    if [ -z "${DESKTOP_DIR:-}" ] || [ ! -d "$DESKTOP_DIR" ]; then
        DESKTOP_DIR="$HOME/Desktop"
    fi
}

# 检测 Claude 技能目录 | Detect Claude skills directory
detect_claude_skills_directory() {
    local system_type=$(uname -s)

    case "$system_type" in
        Darwin)
            CLAUDE_SKILLS_DIR="$HOME/Library/Application Support/Claude/skills"
            ;;
        Linux)
            CLAUDE_SKILLS_DIR="$HOME/.config/Claude/skills"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            print_error "Windows support is not yet implemented"
            print_info "Please manually copy your folder to:"
            echo "  %APPDATA%\\Claude\\skills"
            exit 1
            ;;
        *)
            print_error "Unknown operating system: $system_type"
            exit 1
            ;;
    esac
}

# 显示帮助 | Show help
show_help() {
    echo "Usage: $0 [FOLDER_PATH] [OPTIONS]"
    echo ""
    echo "从桌面（或任意路径）添加一个文件夹作为技能。"
    echo "Add a folder from your Desktop (or any path) as a skill."
    echo ""
    echo "Arguments:"
    echo "  FOLDER_PATH   要添加的文件夹路径 | Path to the folder to add"
    echo "                (省略则交互式从桌面选择 | omit to pick from Desktop interactively)"
    echo ""
    echo "Options:"
    echo "  --install     同时安装到 Claude 技能目录 | Also install into Claude's skills directory"
    echo "  --help, -h    显示此帮助 | Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                # pick a folder from your Desktop"
    echo "  $0 ~/Desktop/my-skill             # add ~/Desktop/my-skill to skills/"
    echo "  $0 ~/Desktop/my-skill --install   # add and install into Claude"
}

# 交互式从桌面选择文件夹 | Interactively pick a folder from the Desktop
pick_folder_from_desktop() {
    detect_desktop_directory

    if [ ! -d "$DESKTOP_DIR" ]; then
        print_error "Desktop directory not found at: $DESKTOP_DIR"
        echo "请直接指定文件夹路径 | Please pass a folder path directly:"
        echo "  $0 /path/to/your/folder"
        exit 1
    fi

    print_header "Add a Folder from your Desktop"
    echo ""
    print_info "Desktop: $DESKTOP_DIR"
    echo ""

    local -a folders=()
    for dir in "$DESKTOP_DIR"/*/; do
        [ -d "$dir" ] || continue
        folders+=("$(basename "$dir")")
    done

    if [ ${#folders[@]} -eq 0 ]; then
        print_error "No folders found on your Desktop"
        echo "请直接指定文件夹路径 | Please pass a folder path directly:"
        echo "  $0 /path/to/your/folder"
        exit 1
    fi

    echo "桌面上的文件夹 | Folders on your Desktop (${#folders[@]} total):"
    echo ""
    for i in "${!folders[@]}"; do
        printf "  %2d) %s\n" "$((i + 1))" "${folders[$i]}"
    done
    echo ""
    echo "说明 | Instructions:"
    echo "  输入文件夹编号 | Enter a folder number (e.g., 1)"
    echo "  输入 'cancel' 取消 | Type 'cancel' to exit"
    echo ""

    read -p "选择 | Select: " -r selection

    if [ "$selection" = "cancel" ]; then
        print_info "Cancelled"
        exit 0
    fi

    if ! [[ $selection =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#folders[@]} ]; then
        print_error "Invalid selection: $selection"
        exit 1
    fi

    SOURCE_FOLDER="$DESKTOP_DIR/${folders[$((selection - 1))]}"
}

# 校验来源文件夹 | Validate the source folder
validate_source_folder() {
    # 展开 ~ | Expand ~
    SOURCE_FOLDER="${SOURCE_FOLDER/#\~/$HOME}"

    if [ ! -d "$SOURCE_FOLDER" ]; then
        print_error "Folder not found: $SOURCE_FOLDER"
        exit 1
    fi

    SOURCE_FOLDER="$(cd "$SOURCE_FOLDER" && pwd)"
    FOLDER_NAME="$(basename "$SOURCE_FOLDER")"

    # 防止把仓库自身或 skills 目录添加进来
    # Prevent adding the repo itself or the skills directory into itself
    case "$SOURCE_FOLDER" in
        "$REPO_DIR"|"$SKILLS_REPO_DIR"|"$SKILLS_REPO_DIR"/*)
            print_error "Cannot add a folder that is already inside this repository"
            exit 1
            ;;
    esac
}

# 确保文件夹包含 SKILL.md | Ensure the folder contains a SKILL.md
ensure_skill_md() {
    if [ -f "$SOURCE_FOLDER/SKILL.md" ]; then
        print_info "Found SKILL.md in: $FOLDER_NAME"
        return 0
    fi

    print_warning "No SKILL.md found in: $FOLDER_NAME"
    echo ""
    echo "Claude 技能需要一个 SKILL.md 文件。"
    echo "Claude skills need a SKILL.md file."
    echo ""
    read -p "是否创建一个模板 SKILL.md？| Create a template SKILL.md? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Continuing without SKILL.md (the folder will be copied as-is)"
        return 0
    fi

    CREATE_SKILL_MD=1
}

# 写入模板 SKILL.md | Write a template SKILL.md
write_template_skill_md() {
    local dest_dir=$1
    cat > "$dest_dir/SKILL.md" <<EOF
---
name: $FOLDER_NAME
description: Describe when Claude should use this skill. 描述 Claude 应该在什么时候使用这个技能。
---

# $FOLDER_NAME

<!--
在这里编写技能说明 | Write your skill instructions here.

建议包含 | Suggested sections:
- 2 秒钩子框架 | 2-Second Hook Framework
- 时间线分段 | Timeline Segmentation
- 摄像机运动 | Camera Movement
- 灯光与氛围 | Lighting & Atmosphere
- 声音设计 | Sound Design
- 示例提示词 | Example Prompts
-->
EOF
    print_info "Created template SKILL.md"
}

# 复制到仓库 skills/ 目录 | Copy into the repo's skills/ directory
add_to_repo() {
    local dest="$SKILLS_REPO_DIR/$FOLDER_NAME"

    mkdir -p "$SKILLS_REPO_DIR"

    if [ -d "$dest" ]; then
        print_warning "A skill named '$FOLDER_NAME' already exists in skills/"
        read -p "是否覆盖？| Overwrite? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipped copying into the repository"
            return 0
        fi
        rm -rf "$dest"
    fi

    mkdir -p "$dest"
    cp -r "$SOURCE_FOLDER"/. "$dest/"

    if [ "${CREATE_SKILL_MD:-0}" = "1" ]; then
        write_template_skill_md "$dest"
    fi

    print_info "Added to repository: skills/$FOLDER_NAME"
    ADDED_TO_REPO=1
}

# 安装到 Claude 技能目录 | Install into Claude's skills directory
install_to_claude() {
    detect_claude_skills_directory

    if [ ! -d "$CLAUDE_SKILLS_DIR" ]; then
        print_warning "Claude skills directory not found at: $CLAUDE_SKILLS_DIR"
        read -p "是否要创建此目录？| Create this directory? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Cannot install without the Claude skills directory"
            return 1
        fi
        mkdir -p "$CLAUDE_SKILLS_DIR"
        print_info "Created skills directory: $CLAUDE_SKILLS_DIR"
    fi

    local dest="$CLAUDE_SKILLS_DIR/$FOLDER_NAME"

    if [ -d "$dest" ]; then
        print_warning "Skill already installed in Claude: $FOLDER_NAME"
        read -p "是否覆盖？| Overwrite? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipped installing into Claude"
            return 0
        fi
        rm -rf "$dest"
    fi

    mkdir -p "$dest"
    if [ "${ADDED_TO_REPO:-0}" = "1" ]; then
        # 从仓库副本安装（包含模板 SKILL.md）| Install from the repo copy (includes template SKILL.md)
        cp -r "$SKILLS_REPO_DIR/$FOLDER_NAME"/. "$dest/"
    else
        cp -r "$SOURCE_FOLDER"/. "$dest/"
        if [ "${CREATE_SKILL_MD:-0}" = "1" ]; then
            write_template_skill_md "$dest"
        fi
    fi

    print_info "Installed into Claude: $dest"
    INSTALLED_TO_CLAUDE=1
}

# 主函数 | Main function
main() {
    SOURCE_FOLDER=""
    DO_INSTALL=0

    for arg in "$@"; do
        case "$arg" in
            "--install")
                DO_INSTALL=1
                ;;
            "--help"|"-h")
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $arg"
                echo ""
                show_help
                exit 1
                ;;
            *)
                if [ -n "$SOURCE_FOLDER" ]; then
                    print_error "Only one folder can be added at a time"
                    exit 1
                fi
                SOURCE_FOLDER="$arg"
                ;;
        esac
    done

    if [ -z "$SOURCE_FOLDER" ]; then
        pick_folder_from_desktop
    fi

    validate_source_folder

    print_header "Adding Folder: $FOLDER_NAME"
    echo ""
    print_item "Source: $SOURCE_FOLDER"
    echo ""

    ensure_skill_md
    add_to_repo

    if [ "$DO_INSTALL" = "1" ]; then
        install_to_claude
    else
        echo ""
        read -p "是否也安装到 Claude？| Also install into Claude? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_to_claude
        fi
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "完成！| Done!"
    echo ""
    if [ "${ADDED_TO_REPO:-0}" = "1" ]; then
        echo "已添加到仓库 | Added to repository:"
        echo "  skills/$FOLDER_NAME"
    fi
    if [ "${INSTALLED_TO_CLAUDE:-0}" = "1" ]; then
        echo ""
        echo "已安装到 Claude | Installed into Claude:"
        echo "  $CLAUDE_SKILLS_DIR/$FOLDER_NAME"
        echo ""
        echo "请重新启动 Claude 以加载新技能。"
        echo "Please restart Claude to load the new skill."
    fi
    echo "═══════════════════════════════════════════════════════════"
}

# 运行主函数 | Run main function
main "$@"
