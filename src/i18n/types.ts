export type Locale = "ja" | "en" | "de" | "fr" | "zh" | "ko";

export interface Translations {
	// App
	appName: string;

	// Welcome
	welcomeTo: string;
	welcomeSubWithTypes: string;
	welcomeSubNoTypes: string;
	welcomeSubNoWorkspace: string;
	openingWorkspace: string;
	openWorkspace: string;
	registeredWorkspaces: string;
	registerWorkspace: string;
	removeWorkspace: string;
	noWorkspacesRegistered: string;

	// Sidebar
	closeWorkspace: string;
	contentTypes: string;
	noContentTypesYet: string;
	settings: string;
	darkMode: string;
	lightMode: string;

	// Content Type Page
	newFile: string;
	loading: string;
	contentTypeNotFound: string;
	noFilesYet: string;
	deleteFile: string;
	confirmDeleteFile: string;
	confirmDeleteContentType: string;
	confirmRemoveField: string;
	confirmRemoveWorkspace: string;

	// Editor
	lastUpdated: string;
	unsavedChanges: string;
	saving: string;
	save: string;
	frontMatter: string;
	commaSeparatedValues: string;
	writeMarkdownHere: string;

	// Settings
	addContentType: string;
	noContentTypesConfigured: string;
	fields: string;
	edit: string;
	delete: string;
	newContentType: string;
	editContentType: string;
	name: string;
	folder: string;
	sortField: string;
	sortOrder: string;
	descending: string;
	ascending: string;
	frontMatterFields: string;
	addField: string;
	fieldName: string;
	fieldTypeString: string;
	fieldTypeText: string;
	fieldTypeNumber: string;
	fieldTypeBoolean: string;
	fieldTypeDate: string;
	fieldTypeDatetime: string;
	fieldTypeSelect: string;
	fieldTypeTags: string;
	required: string;
	editOptions: string;
	addOption: string;
	optionPlaceholder: string;
	noOptionsYet: string;
	removeField: string;
	create: string;
	cancel: string;

	// File creation / rename
	enterFileName: string;
	fileAlreadyExists: string;
	invalidFileName: string;
	renameFile: string;
	contentTypeAlreadyExists: string;

	// Error / Navigation
	goBack: string;
	backToHome: string;
	errorOccurred: string;
	fileNotFound: string;
	retry: string;

	// Toolbar
	toolbar: string;
	bold: string;
	italic: string;
	underline: string;
	strikethrough: string;
	inlineCode: string;
	heading1: string;
	heading2: string;
	heading3: string;
	bulletList: string;
	orderedList: string;
	taskList: string;
	blockquote: string;
	codeBlock: string;
	horizontalRule: string;
	link: string;
	image: string;
	undo: string;
	redo: string;
	enterUrl: string;
	enterImageUrl: string;
	removeLink: string;
	apply: string;

	// Global Settings
	globalSettings: string;
	appearance: string;
	theme: string;
	language: string;
}
