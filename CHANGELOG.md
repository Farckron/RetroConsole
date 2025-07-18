# Changelog

Всі значні зміни в цьому проекті будуть задокументовані в цьому файлі.

Формат базується на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
і цей проект дотримується [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation structure
- Docker development environment
- Professional README with detailed instructions
- API documentation
- Architecture documentation
- Development guide
- Testing framework setup
- Contributing guidelines
- Security policy

### Changed
- Improved project structure for GitHub
- Enhanced Docker configuration for development

### Fixed
- Fixed tasks.json structure issue that caused API errors

## [1.0.0] - 2025-07-18

### Added
- Initial release of Retro Console Task Manager
- Terminal-style user interface with retro aesthetics
- Basic task management functionality (CRUD operations)
- RESTful API for task operations
- File-based JSON storage system
- Docker support for development
- Responsive design for mobile and desktop
- Command-line interface with the following commands:
  - `ls` - List all tasks
  - `add <description>` - Add new task
  - `complete <id>` - Mark task as completed
  - `delete <id>` - Delete task
  - `clear` - Clear all tasks
  - `help` - Show available commands
  - `stats` - Show task statistics
  - `export` - Export tasks to JSON
  - `import` - Import tasks from JSON

### Technical Features
- Node.js + Express.js backend
- Vanilla JavaScript frontend
- CSS3 with retro terminal styling
- JSON file-based database
- CORS support for cross-origin requests
- Error handling and validation
- Modular code architecture

### Infrastructure
- Docker containerization
- Docker Compose for development
- Live reload with nodemon
- Volume mapping for development
- Health check endpoints

## [0.1.0] - 2025-07-17

### Added
- Project initialization
- Basic file structure
- Initial terminal UI concept
- Core task model design

---

## Типи змін

- **Added** - для нових функцій
- **Changed** - для змін в існуючій функціональності
- **Deprecated** - для функцій, які будуть видалені в майбутніх версіях
- **Removed** - для видалених функцій
- **Fixed** - для виправлення багів
- **Security** - для виправлень безпеки