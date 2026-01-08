export enum Language {
	EN = 'en',
	ES = 'es',
	IT = 'it'
}

export interface Translations {
	[key: string]: {
		[lang: string]: string;
	};
}

export const translations: Translations = {
	'nav.home': {
		en: 'Home',
		es: 'Inicio',
		it: 'Home'
	},
	'nav.game': {
		en: 'Game',
		es: 'Juego',
		it: 'Gioco'
	},
	'nav.profile': {
		en: 'Profile',
		es: 'Perfil',
		it: 'Profilo'
	},
	'nav.tournament': {
		en: 'Tournament',
		es: 'Torneo',
		it: 'Torneo'
	},
	'nav.logout': {
		en: 'Logout',
		es: 'Cerrar Sesión',
		it: 'Disconnetti'
	},
	'auth.login': {
		en: 'Login',
		es: 'Iniciar Sesión',
		it: 'Accedi'
	},
	'auth.register': {
		en: 'Register',
		es: 'Registrarse',
		it: 'Registrati'
	},
	'auth.username': {
		en: 'Username',
		es: 'Usuario',
		it: 'Nome utente'
	},
	'auth.password': {
		en: 'Password',
		es: 'Contraseña',
		it: 'Password'
	},
	'auth.email': {
		en: 'Email',
		es: 'Correo',
		it: 'Email'
	},
	'game.start': {
		en: 'Start Game',
		es: 'Iniciar Juego',
		it: 'Inizia Gioco'
	},
	'game.score': {
		en: 'Score',
		es: 'Puntuación',
		it: 'Punteggio'
	},
	'game.player': {
		en: 'Player',
		es: 'Jugador',
		it: 'Giocatore'
	},
	'game.winner': {
		en: 'Winner',
		es: 'Ganador',
		it: 'Vincitore'
	},
	'settings.language': {
		en: 'Language',
		es: 'Idioma',
		it: 'Lingua'
	},
	'settings.change_language': {
		en: 'Change Language',
		es: 'Cambiar Idioma',
		it: 'Cambia Lingua'
	},
	'common.welcome': {
		en: 'Welcome',
		es: 'Bienvenido',
		it: 'Benvenuto'
	},
	'common.loading': {
		en: 'Loading...',
		es: 'Cargando...',
		it: 'Caricamento...'
	},
	'common.error': {
		en: 'Error',
		es: 'Error',
		it: 'Errore'
	},
	'common.success': {
		en: 'Success',
		es: 'Éxito',
		it: 'Successo'
	},
	'common.cancel': {
		en: 'Cancel',
		es: 'Cancelar',
		it: 'Annulla'
	},
	'common.confirm': {
		en: 'Confirm',
		es: 'Confirmar',
		it: 'Conferma'
	},
	'common.save': {
		en: 'Save',
		es: 'Guardar',
		it: 'Salva'
	}
};

const LANGUAGE_STORAGE_KEY = 'preferred_language';

let currentLanguage: Language = Language.EN;

export function initializeLanguage(): Language {
	const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
	if (storedLang && Object.values(Language).includes(storedLang as Language)) {
		currentLanguage = storedLang as Language;
	} else {
		const browserLang = navigator.language.split('-')[0];
		if (Object.values(Language).includes(browserLang as Language)) {
			currentLanguage = browserLang as Language;
		}
	}
	
	document.documentElement.lang = currentLanguage;
	return currentLanguage;
}

export function getCurrentLanguage(): Language {
	return currentLanguage;
}

export function changeLanguage(lang: Language): void {
	currentLanguage = lang;
	localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
	document.documentElement.lang = lang;
	
	const event = new CustomEvent('languageChanged', { detail: { language: lang } });
	window.dispatchEvent(event);
	
	updateTranslations();
}

export function translate(key: string, lang?: Language): string {
	let targetLang: Language;
	if (lang) {
		targetLang = lang;
	} else {
		targetLang = currentLanguage;
	}
	
	if (translations[key] && translations[key][targetLang]) {
		return translations[key][targetLang];
	}
	
	if (translations[key] && translations[key][Language.EN]) {
		return translations[key][Language.EN];
	}
	
	return key;
}

export function updateTranslations(): void {
	const elements = document.querySelectorAll('[data-i18n]');
	elements.forEach((element) => {
		const key = element.getAttribute('data-i18n');
		if (key) {
			element.textContent = translate(key);
		}
	});
	
	const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
	placeholderElements.forEach((element) => {
		const key = element.getAttribute('data-i18n-placeholder');
		if (key && element instanceof HTMLInputElement) {
			element.placeholder = translate(key);
		}
	});
}

export function addTranslation(key: string, newTranslations: { [lang: string]: string }): void {
	if (!translations[key]) {
		translations[key] = newTranslations;
	} else {
		Object.assign(translations[key], newTranslations);
	}
}

export interface LanguageButtonConfig {
	container?: HTMLElement;
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	style?: 'dropdown' | 'flags' | 'text';
	className?: string;
}

const languageFlags: { [key in Language]: string } = {
	[Language.EN]: '🇬🇧',
	[Language.ES]: '🇪🇸',
	[Language.IT]: '🇮🇹'
};

const languageNames: { [key in Language]: string } = {
	[Language.EN]: 'English',
	[Language.ES]: 'Español',
	[Language.IT]: 'Italiano'
};

export function createLanguageButton(config: LanguageButtonConfig = {}): HTMLElement {
	const {
		container,
		position = 'top-right',
		style = 'dropdown',
		className = ''
	} = config;
	
	const wrapper = document.createElement('div');
	wrapper.className = `language-switcher ${position} ${className}`;
	wrapper.style.cssText = getPositionStyles(position);
	
	if (style === 'dropdown') {
		createDropdownButton(wrapper);
	} else if (style === 'flags') {
		createFlagsButton(wrapper);
	} else {
		createTextButton(wrapper);
	}
	
	if (container) {
		container.appendChild(wrapper);
	} else {
		document.body.appendChild(wrapper);
	}
	
	return wrapper;
}

function createDropdownButton(wrapper: HTMLElement): void {
	const button = document.createElement('button');
	button.className = 'language-btn';
	button.innerHTML = `${languageFlags[currentLanguage]} ${languageNames[currentLanguage]}`;
	button.style.cssText = `
		padding: 8px 16px;
		border: 2px solid #333;
		background: #fff;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: all 0.3s ease;
	`;
	
	const dropdown = document.createElement('div');
	dropdown.className = 'language-dropdown';
	dropdown.style.cssText = `
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 8px;
		background: #fff;
		border: 2px solid #333;
		border-radius: 4px;
		display: none;
		min-width: 150px;
		box-shadow: 0 4px 6px rgba(0,0,0,0.1);
		z-index: 1000;
	`;
	
	Object.values(Language).forEach((lang) => {
		const option = document.createElement('button');
		option.className = 'language-option';
		option.innerHTML = `${languageFlags[lang]} ${languageNames[lang]}`;
		
		let optionBg: string;
		if (lang === currentLanguage) {
			optionBg = '#f0f0f0';
		} else {
			optionBg = '#fff';
		}
		
		option.style.cssText = `
			width: 100%;
			padding: 10px 16px;
			border: none;
			background: ${optionBg};
			text-align: left;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 8px;
			transition: background 0.2s;
		`;
		
		option.addEventListener('mouseenter', () => {
			option.style.background = '#f0f0f0';
		});
		
		option.addEventListener('mouseleave', () => {
			if (lang === currentLanguage) {
				option.style.background = '#f0f0f0';
			} else {
				option.style.background = '#fff';
			}
		});
		
		option.addEventListener('click', () => {
			changeLanguage(lang);
			button.innerHTML = `${languageFlags[lang]} ${languageNames[lang]}`;
			dropdown.style.display = 'none';
			
			dropdown.querySelectorAll('.language-option').forEach((opt, idx) => {
				const optLang = Object.values(Language)[idx];
				if (optLang === lang) {
					(opt as HTMLElement).style.background = '#f0f0f0';
				} else {
					(opt as HTMLElement).style.background = '#fff';
				}
			});
		});
		
		dropdown.appendChild(option);
	});
	
	button.addEventListener('click', (e) => {
		e.stopPropagation();
		if (dropdown.style.display === 'none') {
			dropdown.style.display = 'block';
		} else {
			dropdown.style.display = 'none';
		}
	});
	
	document.addEventListener('click', () => {
		dropdown.style.display = 'none';
	});
	
	wrapper.style.position = 'relative';
	wrapper.appendChild(button);
	wrapper.appendChild(dropdown);
}

function createFlagsButton(wrapper: HTMLElement): void {
	wrapper.style.cssText += 'display: flex; gap: 8px;';
	
	Object.values(Language).forEach((lang) => {
		const button = document.createElement('button');
		button.className = 'language-flag-btn';
		button.innerHTML = languageFlags[lang];
		button.title = languageNames[lang];
		
		let borderColor: string;
		let opacity: string;
		if (lang === currentLanguage) {
			borderColor = '#333';
			opacity = '1';
		} else {
			borderColor = '#ccc';
			opacity = '0.6';
		}
		
		button.style.cssText = `
			padding: 8px;
			border: 2px solid ${borderColor};
			background: #fff;
			border-radius: 4px;
			cursor: pointer;
			font-size: 20px;
			transition: all 0.3s ease;
			opacity: ${opacity};
		`;
		
		button.addEventListener('mouseenter', () => {
			button.style.opacity = '1';
			button.style.transform = 'scale(1.1)';
		});
		
		button.addEventListener('mouseleave', () => {
			if (lang === currentLanguage) {
				button.style.opacity = '1';
			} else {
				button.style.opacity = '0.6';
			}
			button.style.transform = 'scale(1)';
		});
		
		button.addEventListener('click', () => {
			changeLanguage(lang);
			
			wrapper.querySelectorAll('.language-flag-btn').forEach((btn, idx) => {
				const btnLang = Object.values(Language)[idx];
				if (btnLang === lang) {
					(btn as HTMLElement).style.borderColor = '#333';
					(btn as HTMLElement).style.opacity = '1';
				} else {
					(btn as HTMLElement).style.borderColor = '#ccc';
					(btn as HTMLElement).style.opacity = '0.6';
				}
			});
		});
		
		wrapper.appendChild(button);
	});
}

function createTextButton(wrapper: HTMLElement): void {
	wrapper.style.cssText += 'display: flex; gap: 8px;';
	
	Object.values(Language).forEach((lang) => {
		const button = document.createElement('button');
		button.className = 'language-text-btn';
		button.textContent = lang.toUpperCase();
		
		let bgColor: string;
		let textColor: string;
		if (lang === currentLanguage) {
			bgColor = '#333';
			textColor = '#fff';
		} else {
			bgColor = 'transparent';
			textColor = '#333';
		}
		
		button.style.cssText = `
			padding: 6px 12px;
			border: none;
			background: ${bgColor};
			color: ${textColor};
			border-radius: 4px;
			cursor: pointer;
			font-size: 12px;
			font-weight: bold;
			transition: all 0.3s ease;
		`;
		
		button.addEventListener('mouseenter', () => {
			if (lang !== currentLanguage) {
				button.style.background = '#f0f0f0';
			}
		});
		
		button.addEventListener('mouseleave', () => {
			if (lang === currentLanguage) {
				button.style.background = '#333';
			} else {
				button.style.background = 'transparent';
			}
		});
		
		button.addEventListener('click', () => {
			changeLanguage(lang);
			
			wrapper.querySelectorAll('.language-text-btn').forEach((btn, idx) => {
				const isActive = Object.values(Language)[idx] === lang;
				if (isActive) {
					(btn as HTMLElement).style.background = '#333';
					(btn as HTMLElement).style.color = '#fff';
				} else {
					(btn as HTMLElement).style.background = 'transparent';
					(btn as HTMLElement).style.color = '#333';
				}
			});
		});
		
		wrapper.appendChild(button);
	});
}

function getPositionStyles(position: string): string {
	const base = 'position: fixed; z-index: 9999;';
	
	switch (position) {
		case 'top-left':
			return `${base} top: 20px; left: 20px;`;
		case 'top-right':
			return `${base} top: 20px; right: 20px;`;
		case 'bottom-left':
			return `${base} bottom: 20px; left: 20px;`;
		case 'bottom-right':
			return `${base} bottom: 20px; right: 20px;`;
		default:
			return `${base} top: 20px; right: 20px;`;
	}
}

initializeLanguage();

class LanguageButtonElement extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		let style = this.getAttribute('style-type');
		if (!style) {
			style = 'dropdown';
		}
		
		let position = this.getAttribute('position');
		if (!position) {
			position = 'top-right';
		}
		
		let className = this.getAttribute('class');
		if (!className) {
			className = '';
		}

		const config: LanguageButtonConfig = {
			container: this,
			style: style as 'dropdown' | 'flags' | 'text',
			position: position as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
			className: className
		};

		createLanguageButton(config);
	}
}

customElements.define('lang-button', LanguageButtonElement);

export default {
	Language,
	initializeLanguage,
	getCurrentLanguage,
	changeLanguage,
	translate,
	updateTranslations,
	addTranslation,
	createLanguageButton,
	translations
};
