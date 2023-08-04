import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Container,
	Flex,
	Box,
	Heading,
	Select,
	Button,
	Text,
	Badge,
	CircularProgress,
	CircularProgressLabel,
	Stack,
	HStack,
	VStack,
	IconButton,
	Tooltip,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Input,
	InputGroup,
	InputLeftElement,
	useDisclosure,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Spinner,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	Grid,
	GridItem,
	Stat,
	StatLabel,
	StatNumber,
	Progress,
} from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import { MdArrowDropDown } from "react-icons/md";
import { VscDebugAll } from "react-icons/vsc";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { CgArrowsExchange } from "react-icons/cg";
import { FaCopy, FaCheck, FaDownload, FaInfoCircle, FaShieldAlt, FaTrophy, FaLightbulb, FaBolt, FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { codeModes, codeThemes } from "./constants";
import { getConvertedCode, getDebugResponse, getQualityCheck } from "./api";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Premium Markdown renderer for explanations
const renderMarkdown = (text) => {
	if (!text) return { __html: "" };
	let html = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	// Headings
	html = html.replace(/^### (.*$)/gim, '<h4 style="font-size: 1.05rem; font-weight: 700; margin-top: 14px; margin-bottom: 6px; color: #e2e8f0; font-family: sans-serif;">$1</h4>');
	html = html.replace(/^## (.*$)/gim, '<h3 style="font-size: 1.2rem; font-weight: 700; margin-top: 18px; margin-bottom: 8px; color: #f7fafc; font-family: sans-serif;">$1</h3>');
	html = html.replace(/^# (.*$)/gim, '<h2 style="font-size: 1.4rem; font-weight: 800; margin-top: 22px; margin-bottom: 12px; color: #ffffff; font-family: sans-serif;">$1</h2>');

	// Bold
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #ffffff;">$1</strong>');
	
	// Italic
	html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #cbd5e0;">$1</em>');

	// Inline Code
	html = html.replace(/`(.*?)`/g, '<code style="font-family: \'Fira Code\', monospace; background-color: #2d3748; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; color: #ed8936;">$1</code>');

	// Bullet points
	html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 6px; list-style-type: square; color: #cbd5e0; font-size: 0.95rem;">$1</li>');
	html = html.replace(/^\s*\*\s+(.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 6px; list-style-type: square; color: #cbd5e0; font-size: 0.95rem;">$1</li>');

	// Map empty lines or normal text to paragraphs
	html = html.split('\n').map(line => {
		const trimmed = line.trim();
		if (!trimmed) return "";
		if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
			return line;
		}
		return `<p style="margin-bottom: 10px; line-height: 1.62; color: #a0aec0; font-size: 0.95rem;">${line}</p>`;
	}).join('\n');

	return { __html: html };
};

function App() {
	// Editor states
	const [code, setCode] = useState(`function calculateFactorial(n) {
  if (n < 0) return -1;
  if (n === 0) return 1;
  
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result = result * i;
  }
  return result;
}`);
	const [sourceLang, setSourceLang] = useState("javascript");
	const [targetLang, setTargetLang] = useState("typescript");
	const [editorTheme, setEditorTheme] = useState("twilight");

	// Key manager states
	const [userKey, setUserKey] = useState("");
	const [isKeySaved, setIsKeySaved] = useState(false);

	// Output states
	const [activeTab, setActiveTab] = useState(0);
	const [loading, setLoading] = useState(false);
	
	const [convertedCode, setConvertedCode] = useState("");
	const [debugResult, setDebugResult] = useState(null);
	const [qualityResult, setQualityResult] = useState(null);

	// Modal disclosure
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Copy tracking
	const [copiedInput, setCopiedInput] = useState(false);
	const [copiedOutput, setCopiedOutput] = useState(false);

	// Initialize API key from storage
	useEffect(() => {
		const savedKey = localStorage.getItem("gemini_user_key");
		if (savedKey) {
			setUserKey(savedKey);
			setIsKeySaved(true);
		}
	}, []);

	const saveApiKey = () => {
		if (userKey.trim() === "") {
			localStorage.removeItem("gemini_user_key");
			setIsKeySaved(false);
			toast.info("Custom API key removed. Using server configuration.");
		} else {
			localStorage.setItem("gemini_user_key", userKey.trim());
			setIsKeySaved(true);
			toast.success("Gemini API Key configured successfully!");
		}
		onClose();
	};

	const clearApiKey = () => {
		setUserKey("");
		localStorage.removeItem("gemini_user_key");
		setIsKeySaved(false);
		toast.info("Custom API key cleared.");
		onClose();
	};

	const handleCopy = (text, setCopied) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success("Code copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownload = (content, filename) => {
		const element = document.createElement("a");
		const file = new Blob([content], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = filename;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		toast.success("File downloaded!");
	};

	// Operations
	const handleConvert = async () => {
		setLoading(true);
		try {
			const res = await getConvertedCode(code, sourceLang, targetLang);
			if (res.status === 200) {
				setConvertedCode(res.data.convertedCode);
				toast.success("Code converted successfully!");
			}
		} catch (err) {
			const errMsg = err.response?.data?.error || "Failed to convert code.";
			toast.error(errMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleDebug = async () => {
		setLoading(true);
		try {
			const res = await getDebugResponse(code);
			if (res.status === 200) {
				setDebugResult(res.data.debugInfo);
				toast.success("Code debug analysis finished!");
			}
		} catch (err) {
			const errMsg = err.response?.data?.error || "Failed to run debugging.";
			toast.error(errMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleQualityCheck = async () => {
		setLoading(true);
		try {
			const res = await getQualityCheck(code);
			if (res.status === 200) {
				setQualityResult(res.data.qualityReport);
				toast.success("Code quality check complete!");
			}
		} catch (err) {
			const errMsg = err.response?.data?.error || "Failed to analyze code.";
			toast.error(errMsg);
		} finally {
			setLoading(false);
		}
	};

	// Helper to determine score color
	const getScoreColor = (score) => {
		if (score >= 80) return "green";
		if (score >= 50) return "yellow";
		return "red";
	};

	return (
		<Container maxW={"container.xl"} w='full' py='6' px='4'>
			<ToastContainer theme="dark" position="bottom-right" />
			
			{/* Navbar Header */}
			<Flex 
				as={motion.div}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				justifyContent={"space-between"} 
				alignItems={"center"} 
				mb='6' 
				p='4'
				borderRadius='2xl'
				className='navbar-glass'
			>
				<HStack spacing='3'>
					<Box 
						as={motion.div}
						whileHover={{ scale: 1.1, rotate: 5 }}
						p='2.5' 
						borderRadius='xl' 
						className='logo-badge'
						color='white'
						fontWeight='800'
						fontSize='md'
						fontFamily="'Outfit', sans-serif"
						display='flex'
						alignItems='center'
						gap='1'
					>
						<HiSparkles /> CR
					</Box>
					<VStack align='start' spacing='0'>
						<Heading
							as='h1'
							size='md'
							fontFamily={"'Outfit', sans-serif"}
							fontWeight={"800"}
							letterSpacing='wider'
							className='title-gradient'
						>
							CodeReviewer AI
						</Heading>
						<HStack spacing='1.5'>
							<Box className='status-dot status-dot-active' />
							<Text fontSize='xs' color='gray.500' fontWeight='500'>Active</Text>
						</HStack>
					</VStack>
				</HStack>

				<HStack spacing='3'>
					{/* Theme selector */}
					<HStack spacing='1.5' bg='rgba(99, 102, 241, 0.08)' px='3' py='1.5' borderRadius='xl' border='1px solid rgba(99, 102, 241, 0.15)'>
						<Text fontSize='xs' color='gray.400' fontWeight='500'>Theme</Text>
						<Select
							size='xs'
							variant='unstyled'
							color='brand.300'
							fontWeight='600'
							onChange={(e) => setEditorTheme(e.target.value)}
							value={editorTheme}
							w='110px'
							cursor='pointer'
						>
							{codeThemes.map((themeName) => (
								<option key={themeName} value={themeName} style={{background: '#0c1017'}}>
									{themeName.replace("_", " ")}
								</option>
							))}
						</Select>
					</HStack>

				</HStack>
			</Flex>

			{/* Main Workspace */}
			<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap='6'>
				
				{/* Left Panel: Input Editor */}
				<GridItem
					as={motion.div}
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Flex 
						flexDirection='column' 
						h='full'
						p='4'
						borderRadius='2xl'
						className='glass-card'
					>
						<Flex justifyContent='space-between' alignItems='center' mb='3'>
							<HStack spacing='2'>
								<Box w='3px' h='16px' bg='brand.400' borderRadius='full' />
								<Heading size='xs' textTransform='uppercase' color='brand.300' letterSpacing='widest' fontFamily="'Outfit', sans-serif">
									Source Code
								</Heading>
							</HStack>
							
							<HStack spacing='2'>
								<IconButton
									as={motion.button}
									whileHover={{ scale: 1.15 }}
									whileTap={{ scale: 0.9 }}
									aria-label="Copy input"
									icon={copiedInput ? <FaCheck /> : <FaCopy />}
									size='xs'
									bg={copiedInput ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.1)'}
									color={copiedInput ? 'green.300' : 'brand.300'}
									border='1px solid'
									borderColor={copiedInput ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)'}
									_hover={{ bg: 'rgba(99, 102, 241, 0.2)' }}
									onClick={() => handleCopy(code, setCopiedInput)}
									borderRadius='lg'
								/>
							</HStack>
						</Flex>

						<Box className='editor-wrapper'>
							<CodeEditor
								value={code}
								onChange={(val) => setCode(val)}
								mode={sourceLang}
								theme={editorTheme}
								height="600px"
							/>
						</Box>
					</Flex>
				</GridItem>

				{/* Right Panel: Tabbed Results & Actions */}
				<GridItem
					as={motion.div}
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Flex 
						flexDirection='column' 
						h='full'
						p='4'
						borderRadius='2xl'
						className='glass-card'
					>
						<Tabs isFitted variant='unstyled' index={activeTab} onChange={(index) => setActiveTab(index)}>
							<TabList mb='4' bg='rgba(99, 102, 241, 0.05)' borderRadius='xl' p='1' border='1px solid rgba(99, 102, 241, 0.1)'>
								<Tab 
									_selected={{ color: 'brand.300', bg: 'rgba(99, 102, 241, 0.15)', borderRadius: 'lg', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}
									fontWeight='600'
									fontSize='sm'
									borderRadius='lg'
									transition='all 0.3s'
									color='gray.500'
									_hover={{ color: 'brand.300' }}
								>
									<CgArrowsExchange style={{ marginRight: '6px', fontSize: '18px' }} />
									Convert
								</Tab>
								<Tab 
									_selected={{ color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', borderRadius: 'lg', boxShadow: '0 0 15px rgba(244, 63, 94, 0.15)' }}
									fontWeight='600'
									fontSize='sm'
									borderRadius='lg'
									transition='all 0.3s'
									color='gray.500'
									_hover={{ color: '#f43f5e' }}
								>
									<VscDebugAll style={{ marginRight: '6px', fontSize: '16px' }} />
									Debug
								</Tab>
								<Tab 
									_selected={{ color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', borderRadius: 'lg', boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' }}
									fontWeight='600'
									fontSize='sm'
									borderRadius='lg'
									transition='all 0.3s'
									color='gray.500'
									_hover={{ color: '#10b981' }}
								>
									<BsFillPatchCheckFill style={{ marginRight: '6px', fontSize: '16px' }} />
									Quality
								</Tab>
							</TabList>

							<TabPanels>
								
								{/* Convert Panel */}
								<TabPanel p='0'>
									<Flex direction='column' gap='4'>
										<Flex justify='space-between' align='center' bg='rgba(99, 102, 241, 0.06)' p='3' borderRadius='xl' border='1px solid rgba(99, 102, 241, 0.12)'>
											<HStack spacing='2'>
												<Text fontSize='xs' color='gray.400' fontWeight='500'>Target:</Text>
												<Select
													size='sm'
													variant='filled'
													bg='rgba(0, 240, 255, 0.05)'
													border='1px solid rgba(0, 240, 255, 0.15)'
													borderRadius='xl'
													w='130px'
													color='brand.300'
													fontWeight='600'
													onChange={(e) => setTargetLang(e.target.value)}
													value={targetLang}
												>
													{codeModes.map((item) => (
														<option key={item} value={item} style={{background: '#0c1017'}}>
															{item.toUpperCase()}
														</option>
													))}
												</Select>
											</HStack>
											<Button
												as={motion.button}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												size='sm'
												className='btn-neon-cyan'
												onClick={handleConvert}
												isLoading={loading && activeTab === 0}
												leftIcon={<FaRocket />}
											>
												Convert
											</Button>
										</Flex>

										{loading && activeTab === 0 ? (
											<VStack py='20' spacing='4' as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
												<HStack spacing='3'>
													<Box className='loading-dot' />
													<Box className='loading-dot' />
													<Box className='loading-dot' />
												</HStack>
												<Text color='gray.400' fontSize='sm' fontWeight='500'>Translating your code...</Text>
											</VStack>
										) : convertedCode ? (
											<Flex direction='column' gap='2'>
												<Flex justify='space-between' align='center'>
													<Badge colorScheme='blue'>Converted to {targetLang}</Badge>
													<HStack>
														<IconButton
															aria-label="Copy output"
															icon={copiedOutput ? <FaCheck /> : <FaCopy />}
															size='xs'
															colorScheme={copiedOutput ? "green" : "gray"}
															onClick={() => handleCopy(convertedCode, setCopiedOutput)}
														/>
														<IconButton
															aria-label="Download file"
															icon={<FaDownload />}
															size='xs'
															onClick={() => handleDownload(convertedCode, `converted.${targetLang}`)}
														/>
													</HStack>
												</Flex>
												<Box borderRadius='lg' overflow='hidden' border='1px solid rgba(255, 255, 255, 0.1)'>
													<CodeEditor
														value={convertedCode}
														mode={targetLang}
														theme={editorTheme}
														readOnly={true}
														height="500px"
													/>
												</Box>
											</Flex>
										) : (
											<VStack py='20' spacing='4' className='empty-state' borderRadius='xl' border='1px dashed rgba(99, 102, 241, 0.15)'>
												<Box as={motion.div} animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} color='brand.400' fontSize='40'><CgArrowsExchange /></Box>
												<Text color='gray.500' fontSize='sm' textAlign='center' maxW='280px' fontWeight='500'>
													Select target language and click <strong style={{color: '#a5b4fc'}}>Convert</strong> to translate your code.
												</Text>
											</VStack>
										)}
									</Flex>
								</TabPanel>

								{/* Debug Panel */}
								<TabPanel p='0'>
									<Flex direction='column' gap='4'>
										<Flex justify='space-between' align='center' bg='rgba(244, 63, 94, 0.06)' p='3' borderRadius='xl' border='1px solid rgba(244, 63, 94, 0.12)'>
											<Text fontSize='xs' color='gray.400' fontWeight='500'>Scan for bugs & logic issues</Text>
											<Button
												as={motion.button}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												size='sm'
												className='btn-neon-cyan'
												onClick={handleDebug}
												isLoading={loading && activeTab === 1}
												leftIcon={<FaBolt />}
											>
												Debug
											</Button>
										</Flex>

										{loading && activeTab === 1 ? (
											<VStack py='20' spacing='4' as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
												<HStack spacing='3'>
													<Box className='loading-dot' />
													<Box className='loading-dot' />
													<Box className='loading-dot' />
												</HStack>
												<Text color='gray.400' fontSize='sm' fontWeight='500'>Analyzing code structure...</Text>
											</VStack>
										) : debugResult ? (
											<Flex direction='column' gap='4'>
												{/* Bug Alert */}
												<Alert 
													status={debugResult.hasErrors ? "warning" : "success"}
													borderRadius='lg'
													variant='subtle'
												>
													<AlertIcon />
													<Box>
														<AlertTitle fontSize='sm' fontWeight='bold'>
															{debugResult.hasErrors ? "Issues Found!" : "Code Looks Clean!"}
														</AlertTitle>
														<AlertDescription fontSize='xs' display='block' mt='1'>
															{debugResult.hasErrors 
																? `The AI has identified ${debugResult.bugs.length} potential issues in your code.`
																: "No significant compiler or execution issues were found."}
														</AlertDescription>
													</Box>
												</Alert>

												{/* Bugs Checklist */}
												{debugResult.hasErrors && debugResult.bugs.length > 0 && (
													<VStack align='stretch' spacing='2'>
														<Text fontSize='xs' fontWeight='700' textTransform='uppercase' color='red.300'>
															Bugs Checklist:
														</Text>
														{debugResult.bugs.map((bug, index) => (
															<HStack 
																key={index} 
																bg='rgba(229, 62, 62, 0.08)' 
																borderLeft='4px solid' 
																borderLeftColor={bug.severity === "High" ? "red.500" : bug.severity === "Medium" ? "orange.400" : "yellow.300"}
																p='3' 
																borderRadius='md' 
																align='start'
																justify='space-between'
																className='bug-item'
															>
																<VStack align='start' spacing='0.5'>
																	<Text fontSize='xs' color='gray.400' fontWeight='600'>
																		{bug.line ? `Line ${bug.line}` : "General Code"}
																	</Text>
																	<Text fontSize='sm' color='gray.200'>{bug.description}</Text>
																</VStack>
																<Badge colorScheme={bug.severity === "High" ? "red" : bug.severity === "Medium" ? "orange" : "yellow"}>
																	{bug.severity}
																</Badge>
															</HStack>
														))}
													</VStack>
												)}

												{/* Code Fix comparison */}
												{debugResult.fixedCode && (
													<Flex direction='column' gap='2'>
														<Flex justify='space-between' align='center'>
															<Badge colorScheme='green'>Fixed Code Preview</Badge>
															<IconButton
																aria-label="Copy fixed code"
																icon={copiedOutput ? <FaCheck /> : <FaCopy />}
																size='xs'
																colorScheme={copiedOutput ? "green" : "gray"}
																onClick={() => handleCopy(debugResult.fixedCode, setCopiedOutput)}
															/>
														</Flex>
														<Box borderRadius='lg' overflow='hidden' border='1px solid rgba(255, 255, 255, 0.1)' maxH='350px' overflowY='auto'>
															<CodeEditor
																value={debugResult.fixedCode}
																mode={sourceLang}
																theme={editorTheme}
																readOnly={true}
																height="350px"
															/>
														</Box>
													</Flex>
												)}

												{/* Explanation */}
												{debugResult.explanation && (
													<Box 
														bg='gray.800' 
														p='4' 
														borderRadius='lg' 
														border='1px solid rgba(255,255,255,0.05)'
													>
														<Heading size='xs' textTransform='uppercase' color='orange.300' mb='2' letterSpacing='wider'>
															Debugging Explanation
														</Heading>
														<Box 
															className="md-content" 
															dangerouslySetInnerHTML={renderMarkdown(debugResult.explanation)} 
														/>
													</Box>
												)}
											</Flex>
										) : (
											<VStack py='20' spacing='4' className='empty-state' borderRadius='xl' border='1px dashed rgba(244, 63, 94, 0.15)'>
												<Box as={motion.div} animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} color='#f43f5e' fontSize='40'><VscDebugAll /></Box>
												<Text color='gray.500' fontSize='sm' textAlign='center' maxW='280px' fontWeight='500'>
													Paste code and click <strong style={{color: '#fda4af'}}>Debug</strong> to find and fix bugs.
												</Text>
											</VStack>
										)}
									</Flex>
								</TabPanel>

								{/* Quality Panel */}
								<TabPanel p='0'>
									<Flex direction='column' gap='4'>
										<Flex justify='space-between' align='center' bg='rgba(16, 185, 129, 0.06)' p='3' borderRadius='xl' border='1px solid rgba(16, 185, 129, 0.12)'>
											<Text fontSize='xs' color='gray.400' fontWeight='500'>Audit performance & best practices</Text>
											<Button
												as={motion.button}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												size='sm'
												className='btn-neon-cyan'
												onClick={handleQualityCheck}
												isLoading={loading && activeTab === 2}
												leftIcon={<HiSparkles />}
											>
												Analyze
											</Button>
										</Flex>

										{loading && activeTab === 2 ? (
											<VStack py='20' spacing='4' as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
												<HStack spacing='3'>
													<Box className='loading-dot' />
													<Box className='loading-dot' />
													<Box className='loading-dot' />
												</HStack>
												<Text color='gray.400' fontSize='sm' fontWeight='500'>Scoring readability, efficiency & security...</Text>
											</VStack>
										) : qualityResult ? (
											<Flex direction='column' gap='4' maxH='530px' overflowY='auto' pr='1'>
												
												{/* Overall Score Meter */}
												<Grid templateColumns="repeat(3, 1fr)" gap='4' bg='gray.800' p='4' borderRadius='lg' border='1px solid rgba(255, 255, 255, 0.05)'>
													<GridItem colSpan={1} display='flex' flexDirection='column' alignItems='center' justifyContent='center' borderRight='1px solid rgba(255,255,255,0.1)'>
														<CircularProgress 
															value={qualityResult.score} 
															color={`${getScoreColor(qualityResult.score)}.400`} 
															size="100px" 
															thickness="8px"
														>
															<CircularProgressLabel color='white' fontWeight='700' fontSize='lg'>
																{qualityResult.score}
															</CircularProgressLabel>
														</CircularProgress>
														<Text fontSize='xs' color='gray.400' mt='2' fontWeight='600'>Overall Score</Text>
													</GridItem>
													
													<GridItem colSpan={2} pl='2'>
														<Heading size='xs' color='green.300' mb='3' textTransform='uppercase'>Category Performance</Heading>
														<Stack spacing='2.5'>
															{Object.entries(qualityResult.categories).map(([key, value]) => (
																<Box key={key}>
																	<Flex justify='space-between' align='center' mb='0.5'>
																		<Text fontSize='xs' textTransform='capitalize' fontWeight='600' color='gray.300'>
																			{key === "bestPractices" ? "Best Practices" : key}
																		</Text>
																		<Badge size='sm' colorScheme={value.score >= 8 ? "green" : value.score >= 5 ? "yellow" : "red"}>
																			{value.score}/10
																		</Badge>
																	</Flex>
																	<Progress 
																		value={value.score * 10} 
																		size='xs' 
																		colorScheme={value.score >= 8 ? "green" : value.score >= 5 ? "yellow" : "red"}
																		borderRadius='full'
																		bg='gray.700'
																	/>
																	<Text fontSize='10px' color='gray.500' mt='1'>{value.feedback}</Text>
																</Box>
															))}
														</Stack>
													</GridItem>
												</Grid>

												{/* Improvements List */}
												{qualityResult.improvements && qualityResult.improvements.length > 0 && (
													<VStack align='stretch' spacing='2'>
														<Text fontSize='xs' fontWeight='700' textTransform='uppercase' color='green.300'>
															Recommendations for Improvement:
														</Text>
														{qualityResult.improvements.map((improvement, index) => (
															<HStack key={index} bg='rgba(56, 161, 105, 0.08)' p='3' borderRadius='md' borderLeft='3px solid #38a169'>
																<Box color='green.400' flexShrink={0}><FaLightbulb /></Box>
																<Text fontSize='sm' color='gray.200'>{improvement}</Text>
															</HStack>
														))}
													</VStack>
												)}

												{/* Quality Summary */}
												{qualityResult.summary && (
													<Box bg='gray.800' p='4' borderRadius='lg' border='1px solid rgba(255,255,255,0.05)'>
														<Heading size='xs' textTransform='uppercase' color='green.300' mb='2' letterSpacing='wider'>
															Executive Summary
														</Heading>
														<Box 
															className="md-content" 
															dangerouslySetInnerHTML={renderMarkdown(qualityResult.summary)} 
														/>
													</Box>
												)}

											</Flex>
										) : (
											<VStack py='20' spacing='4' className='empty-state' borderRadius='xl' border='1px dashed rgba(16, 185, 129, 0.15)'>
												<Box as={motion.div} animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} color='#10b981' fontSize='40'><BsFillPatchCheckFill /></Box>
												<Text color='gray.500' fontSize='sm' textAlign='center' maxW='280px' fontWeight='500'>
													Paste code and click <strong style={{color: '#6ee7b7'}}>Analyze</strong> to audit quality.
												</Text>
											</VStack>
										)}
									</Flex>
								</TabPanel>
							</TabPanels>
						</Tabs>
					</Flex>
				</GridItem>
			</Grid>

			{/* API Key configuration Modal */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered size='md' motionPreset='slideInBottom'>
				<ModalOverlay backdropFilter='blur(12px)' bg='rgba(0,0,0,0.4)' />
				<ModalContent className='modal-glass' borderRadius='2xl'>
					<ModalHeader color='white' borderBottom='1px solid rgba(99, 102, 241, 0.15)' fontSize='md' fontFamily="'Outfit', sans-serif" fontWeight='700'>
						<HStack spacing='2'>
							<Text>Gemini API Configuration</Text>
						</HStack>
					</ModalHeader>
					<ModalCloseButton color='gray.400' />
					
					<ModalBody py='6'>
						<VStack spacing='4' align='stretch'>
							<Text fontSize='sm' color='gray.400'>
								Configure a custom Gemini API Key to run requests using your personal quota.
							</Text>
							
							<Alert status='info' borderRadius='xl' bg='rgba(99, 102, 241, 0.08)' border='1px solid rgba(99, 102, 241, 0.15)'>
								<AlertIcon color='brand.400' />
								<Box fontSize='xs' color='gray.400'>
									Keys are stored locally in <code style={{color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: '4px'}}>localStorage</code> and never leave your machine.
								</Box>
							</Alert>

							<Box>
								<Text fontSize='xs' color='gray.500' mb='2' fontWeight='600' textTransform='uppercase' letterSpacing='wider'>API Key</Text>
								<InputGroup size='md'>
									<Input
										placeholder="AQ.Ab8..."
										type="password"
										value={userKey}
										onChange={(e) => setUserKey(e.target.value)}
										bg='rgba(15, 20, 30, 0.8)'
										borderColor='rgba(99, 102, 241, 0.2)'
										_hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
										_focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #6366f1, 0 0 15px rgba(99, 102, 241, 0.2)' }}
										borderRadius='xl'
										color='white'
									/>
								</InputGroup>
							</Box>
						</VStack>
					</ModalBody>

					<ModalFooter borderTop='1px solid rgba(99, 102, 241, 0.1)'>
						<Button size='sm' color='red.300' variant='ghost' mr='auto' onClick={clearApiKey} isDisabled={!isKeySaved} _hover={{ bg: 'rgba(244, 63, 94, 0.1)' }}>
							Clear Key
						</Button>
						<Button size='sm' color='gray.400' variant='ghost' mr={3} onClick={onClose} _hover={{ bg: 'rgba(99, 102, 241, 0.08)' }}>
							Cancel
						</Button>
						<Button 
							size='sm' 
							bg='linear-gradient(135deg, #6366f1, #8b5cf6)' 
							color='white' 
							_hover={{ bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}
							onClick={saveApiKey}
							borderRadius='xl'
						>
							Save Settings
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Container>
	);
}

export default App;
