/* eslint-disable react/prop-types */
import AceEditor from "react-ace";

// Import Ace modes
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/mode-markdown";

// Import Ace themes
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-solarized_light";

// Helper to map UI language selection to Ace mode names
const getAceMode = (lang) => {
	if (!lang) return "javascript";
	const lower = lang.toLowerCase();
	if (lower === "cpp") return "c_cpp";
	return lower;
};

const CodeEditor = ({ value, onChange, mode = "javascript", theme = "monokai", readOnly = false, height = "500px" }) => {
	return (
		<AceEditor
			mode={getAceMode(mode)}
			theme={theme}
			value={value}
			onChange={onChange}
			readOnly={readOnly}
			showGutter={true}
			name={readOnly ? 'code-editor-readonly' : 'code-editor-input'}
			editorProps={{ $blockScrolling: true }}
			fontSize={14}
			height={height}
			width='100%'
			setOptions={{
				enableBasicAutocompletion: !readOnly,
				enableLiveAutocompletion: !readOnly,
				enableSnippets: false,
				showLineNumbers: true,
				tabSize: 2,
				useWorker: false, // Disable web workers to avoid console errors with React-Ace in dev
			}}
			highlightActiveLine={!readOnly}
			placeholder={readOnly ? 'Output will appear here...' : 'Start typing your code here...'}
		/>
	);
};

export default CodeEditor;
