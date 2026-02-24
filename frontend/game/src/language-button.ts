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
		'game.lost_to_user': {
			en: 'you lost to {username}',
			es: 'perdiste contra {username}',
			it: 'hai perso contro {username}'
		},
		'common.invite_friends': {
			en: 'Invite Friends',
			es: 'Invitar Amigos',
			it: 'Invita Amici'
		},
		'common.manual_invite': {
			en: 'Manual Invite',
			es: 'Invitación manual',
			it: 'Invito manuale'
		},
		'invite_game.title': {
			en: 'Invite Friends',
			es: 'Invitar Amigos',
			it: 'Invita Amici'
		},
		'invite_game.manual_invite': {
			en: 'Manual Invite',
			es: 'Invitación manual',
			it: 'Invito manuale'
		},
		'current_game.type': {
			en: 'Type',
			es: 'Tipo',
			it: 'Tipo'
		},
		'current_game.match': {
			en: 'Match',
			es: 'Partida',
			it: 'Partita'
		},
		'current_game.subtype': {
			en: 'Subtype',
			es: 'Subtipo',
			it: 'Sottotipo'
		},
		'current_game.online': {
			en: 'Online',
			es: 'Online',
			it: 'Online'
		},
		'current_game.visibility': {
			en: 'Visibility',
			es: 'Visibilidad',
			it: 'Visibilità'
		},
		'current_game.private': {
			en: 'Private',
			es: 'Privada',
			it: 'Privata'
		},
		'current_game.size': {
			en: 'Size',
			es: 'Tamaño',
			it: 'Dimensione'
		},
		'current_game.size_1_2': {
			en: '1/2',
			es: '1/2',
			it: '1/2'
		},
		'current_game.creator': {
			en: 'Creator',
			es: 'Creador',
			it: 'Creatore'
		},
		'current_game.test': {
			en: 'test',
			es: 'test',
			it: 'test'
		},
		'current_game.status': {
			en: 'Status',
			es: 'Estado',
			it: 'Stato'
		},
		'current_game.waiting': {
			en: 'Waiting',
			es: 'Esperando',
			it: 'In attesa'
		},
		'current_game.players': {
			en: 'Players:',
			es: 'Jugadores:',
			it: 'Giocatori:'
		},
		'dashboard.title': {
			en: 'Dashboard',
			es: 'Panel',
			it: 'Cruscotto'
		},
		'dashboard.refresh': {
			en: 'Refresh',
			es: 'Refrescar',
			it: 'Aggiorna'
		},
		'common.invite': {
			en: 'INVITE',
			es: 'INVITAR',
			it: 'INVITA'
		},
		'common.full': {
			en: 'FULL',
			es: 'LLENO',
			it: 'PIENO'
		},
		'common.join': {
			en: 'JOIN',
			es: 'UNIRSE',
			it: 'PARTICIPARE'
		},
		'friends.request_accepted': {
			en: 'Friend request accepted!',
			es: '¡Solicitud de amistad aceptada!',
			it: 'Richiesta di amicizia accettata!'
		},
            
		'common.patata1234': {
			en: 'patata1234',
			es: 'patata1234',
			it: 'patata1234'
		},
		'friends.request_from_patata1234': {
			en: '@patata1234 · friend request',
			es: '@patata1234 · solicitud de amistad',
			it: '@patata1234 · richiesta di amicizia'
		},
		'common.close_x': {
			en: 'X',
			es: 'X',
			it: 'X'
		},
		'common.accept': {
			en: 'ACCEPT',
			es: 'ACEPTAR',
			it: 'ACCETTA'
		},
		'friends.request_already_pending': {
			en: 'Friend request already pending',
			es: 'Solicitud de amistad ya pendiente',
			it: 'Richiesta di amicizia già in sospeso'
		},
		'twofa.choose_method': {
			en: 'Choose 2FA Method',
			es: 'Elige método 2FA',
			it: 'Scegli metodo 2FA'
		},
		'twofa.help_text': {
			en: 'Help secure your account by choosing a second factor of authentication to protect your account from unauthorized access.',
			es: 'Ayuda a proteger tu cuenta eligiendo un segundo factor de autenticación para proteger tu cuenta de accesos no autorizados.',
			it: 'Aiuta a proteggere il tuo account scegliendo un secondo fattore di autenticazione per proteggerlo da accessi non autorizzati.'
		},
		'twofa.email': {
			en: 'Set up via Email',
			es: 'Configurar por correo electrónico',
			it: 'Configura tramite email'
		},
		'twofa.skip': {
			en: 'Skip For Now',
			es: 'Omitir por ahora',
			it: 'Salta per ora'
		},
								'create_game.tournament_desc': {
									en: 'Create a multiplayer tournament. King of the Hill style.',
									es: 'Crea un torneo multijugador. Estilo Rey de la Colina.',
									it: 'Crea un torneo multiplayer. Stile King of the Hill.'
								},
								'create_game.party_size': {
									en: 'Party Size',
									es: 'Tamaño del grupo',
									it: 'Dimensione gruppo'
								},
								'create_game.plus': {
									en: '+',
									es: '+',
									it: '+'
								},
								'create_game.anyone_can_join': {
									en: 'Anyone can Join...',
									es: 'Cualquiera puede unirse...',
									it: 'Chiunque può unirsi...'
								},
							'create_game.online_desc': {
								en: 'Post a match online for anyone to join and/or invite player or friend to play directly with them.',
								es: 'Publica una partida en línea para que cualquiera se una y/o invita a un jugador o amigo para jugar directamente con ellos.',
								it: 'Pubblica una partita online a cui chiunque può unirsi e/o invita un giocatore o un amico a giocare direttamente con loro.'
							},
							'create_game.later_invite': {
								en: 'You can later invite friends from search or online friends list.',
								es: 'Puedes invitar amigos más tarde desde la búsqueda o la lista de amigos en línea.',
								it: 'Puoi invitare amici in seguito dalla ricerca o dalla lista amici online.'
							},
							'create_game.only_invite': {
								en: 'Only by Invite....',
								es: 'Solo por invitación....',
								it: 'Solo su invito....'
							},
							'create_game.anyone_join': {
								en: 'Anyone can Join...',
								es: 'Cualquiera puede unirse...',
								it: 'Chiunque può unirsi...'
							},
							'common.swap': {
								en: '⇄',
								es: '⇄',
								it: '⇄'
							},
							'common.send': {
								en: 'SEND',
								es: 'ENVIAR',
								it: 'INVIA'
							},
						'change_username.title': {
							en: 'UPDATE USERNAME',
							es: 'ACTUALIZAR USUARIO',
							it: 'AGGIORNA USERNAME'
						},
						'change_username.new_username': {
							en: 'New Username',
							es: 'Nuevo Usuario',
							it: 'Nuovo Username'
						},
						'change_username.save': {
							en: 'SAVE',
							es: 'GUARDAR',
							it: 'SALVA'
						},
						'change_email.title': {
							en: 'UPDATE EMAIL',
							es: 'ACTUALIZAR EMAIL',
							it: 'AGGIORNA EMAIL'
						},
						'change_email.new_email': {
							en: 'New Email Address',
							es: 'Nueva dirección de correo',
							it: 'Nuovo indirizzo email'
						},
						'change_email.save': {
							en: 'SAVE',
							es: 'GUARDAR',
							it: 'SALVA'
						},
						'change_password.title': {
							en: 'SECURITY',
							es: 'SEGURIDAD',
							it: 'SICUREZZA'
						},
						'change_password.current': {
							en: 'Current Password',
							es: 'Contraseña Actual',
							it: 'Password Attuale'
						},
						'change_password.new': {
							en: 'New Password',
							es: 'Nueva Contraseña',
							it: 'Nuova Password'
						},
						'change_password.confirm': {
							en: 'Confirm Password',
							es: 'Confirmar Contraseña',
							it: 'Conferma Password'
						},
						'change_password.update': {
							en: 'UPDATE',
							es: 'ACTUALIZAR',
							it: 'AGGIORNA'
						},
						'profilepic.select_avatar': {
							en: 'Select Avatar',
							es: 'Seleccionar avatar',
							it: 'Seleziona avatar'
						},
					'change_displayname.title': {
						en: 'UPDATE NAME',
						es: 'ACTUALIZAR NOMBRE',
						it: 'AGGIORNA NOME'
					},
					'change_displayname.new_displayname': {
						en: 'New Display Name',
						es: 'Nuevo Nombre para Mostrar',
						it: 'Nuovo Nome Visualizzato'
					},
					'change_displayname.save': {
						en: 'SAVE',
						es: 'GUARDAR',
						it: 'SALVA'
					},
				'add_friend.title': {
					en: 'Add Friend',
					es: 'Agregar Amigo',
					it: 'Aggiungi Amico'
				},
				'add_friend.enter_username': {
					en: 'Enter username',
					es: 'Ingresa nombre de usuario',
					it: 'Inserisci nome utente'
				},
				'add_friend.send_request': {
					en: 'SEND REQUEST',
					es: 'ENVIAR SOLICITUD',
					it: 'INVIA RICHIESTA'
				},
			'current_game.exit': {
				en: 'Exit',
				es: 'Salir',
				it: 'Esci'
			},
            
			'current_game.invite': {
				en: 'Invite Friends',
				es: 'Invitar Amigos',
				it: 'Invita Amici'
			},
			'current_game.start': {
				en: 'START MATCH',
				es: 'INICIAR PARTIDA',
				it: 'AVVIA PARTITA'
			},
		'requests.title': {
			en: 'Requests',
			es: 'Solicitudes',
			it: 'Richieste'
		},
		'requests.friends': {
			en: 'Friends',
			es: 'Amigos',
			it: 'Amici'
		},
		'requests.matches': {
			en: 'Matches',
			es: 'Partidas',
			it: 'Partite'
		},
		'requests.tournaments': {
			en: 'Tournaments',
			es: 'Torneos',
			it: 'Tornei'
		},
		'current_game.title': {
			en: 'Current Game',
			es: 'Partida Actual',
			it: 'Partita Attuale'
		},
		'find_game.title': {
			en: 'Find Game',
			es: 'Buscar Partida',
			it: 'Trova Partita'
		},
		'find_game.matches': {
			en: 'Matches',
			es: 'Partidas',
			it: 'Partite'
		},
		'find_game.tournaments': {
			en: 'Tournaments',
			es: 'Torneos',
			it: 'Tornei'
		},
		'friends.no_friends': {
			en: 'No friends yet. Add some!',
			es: '¡Aún no tienes amigos! ¡Agrega algunos!',
			it: 'Non hai ancora amici. Aggiungine qualcuno!'
		},
		'friends.add': {
			en: 'ADD +',
			es: 'AÑADIR +',
			it: 'AGGIUNGI +'
		},
		'game.create': {
			en: 'CREATE GAME',
			es: 'CREAR PARTIDA',
			it: 'CREA PARTITA'
		},
		'game.find': {
			en: 'FIND GAME',
			es: 'BUSCAR PARTIDA',
			it: 'TROVA PARTITA'
		},
		'stats.local': {
			en: 'LOCAL',
			es: 'LOCAL',
			it: 'LOCALE'
		},
		'stats.offline': {
			en: 'OFFLINE',
			es: 'EN LÍNEA',
			it: 'IN LINEA'
		},
		'stats.online': {
			en: 'ONLINE',
			es: 'EN LÍNEA',
			it: 'IN LINEA'
		},
		'stats.tourn': {
			en: 'TOURN',
			es: 'TORNEO',
			it: 'TORNEO'
		},
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
	'login.title': {
		en: 'LOG IN',
		es: 'INICIAR SESIÓN',
		it: 'ACCEDI'
	},
	'login.username': {
		en: 'Username',
		es: 'Usuario',
		it: 'Nome utente'
	},
	'login.password': {
		en: 'Password',
		es: 'Contraseña',
		it: 'Password'
	},
	'login.no_account': {
		en: "Don't have an account?",
		es: '¿No tienes una cuenta?',
		it: 'Non hai un account?'
	},
	'login.click_here': {
		en: 'click here',
		es: 'haz clic aquí',
		it: 'clicca qui'
	},
	'login.google': {
		en: 'LOGIN WITH GOOGLE',
		es: 'INICIAR CON GOOGLE',
		it: 'ACCEDI CON GOOGLE'
	},
	'login.submit': {
		en: 'SUBMIT',
		es: 'ENVIAR',
		it: 'INVIA'
	},
	'register.title': {
		en: 'REGISTER',
		es: 'REGISTRARSE',
		it: 'REGISTRATI'
	},
	'register.username': {
		en: 'Username',
		es: 'Usuario',
		it: 'Nome utente'
	},
	'register.displayname': {
		en: 'Display Name',
		es: 'Nombre para mostrar',
		it: 'Nome visualizzato'
	},
	'register.email': {
		en: 'Email',
		es: 'Correo',
		it: 'Email'
	},
	'register.password': {
		en: 'Password',
		es: 'Contraseña',
		it: 'Password'
	},
	'register.have_account': {
		en: 'Already have an account?',
		es: '¿Ya tienes una cuenta?',
		it: 'Hai già un account?'
	},
	'register.click_here': {
		en: 'click here',
		es: 'haz clic aquí',
		it: 'clicca qui'
	},
	'register.submit': {
		en: 'SUBMIT',
		es: 'ENVIAR',
		it: 'INVIA'
	},
	'create_game.title': {
		en: 'Create Game',
		es: 'Crear Partida',
		it: 'Crea Partita'
	},
	'create_game.local': {
		en: 'Local Match',
		es: 'Partida Local',
		it: 'Partita Locale'
	},
	'create_game.online': {
		en: 'Online Match',
		es: 'Partida en Línea',
		it: 'Partita Online'
	},
	'create_game.tournament': {
		en: 'Tournament',
		es: 'Torneo',
		it: 'Torneo'
	},
	'create_game.local_desc': {
		en: 'Play on the same screen using w,s & up, down or play against the computer using an A* algorithm.',
		es: 'Juega en la misma pantalla usando w,s y arriba, abajo o juega contra la computadora usando un algoritmo A*.',
		it: 'Gioca sullo stesso schermo usando w,s e su, giù oppure gioca contro il computer usando un algoritmo A*.'
	},
	'create_game.same_screen': {
		en: 'Same Screen',
		es: 'Misma Pantalla',
		it: 'Stesso Schermo'
	},
	'create_game.ai_perry': {
		en: 'AI PERRY (Easy)',
		es: 'IA PERRY (Fácil)',
		it: 'IA PERRY (Facile)'
	},
	'create_game.ai_morty': {
		en: 'AI MORTY (Medium)',
		es: 'IA MORTY (Medio)',
		it: 'IA MORTY (Medio)'
	},
	'create_game.ai_rick': {
		en: 'AI RICK (Hard)',
		es: 'IA RICK (Difícil)',
		it: 'IA RICK (Difficile)'
	},
	'create_game.submit': {
		en: 'SUBMIT',
		es: 'ENVIAR',
		it: 'INVIA'
	},
	'settings.change_displayname': {
		en: 'CHANGE DISPLAY NAME',
		es: 'CAMBIAR NOMBRE PARA MOSTRAR',
		it: 'CAMBIA NOME VISUALIZZATO'
	},
	'settings.update_username': {
		en: 'UPDATE USERNAME',
		es: 'ACTUALIZAR NOMBRE DE USUARIO',
		it: 'AGGIORNA NOME UTENTE'
	},
	'settings.new_username': {
		en: 'New Username',
		es: 'Nuevo nombre de usuario',
		it: 'Nuovo nome utente'
	},
	'settings.save': {
		en: 'SAVE',
		es: 'GUARDAR',
		it: 'SALVA'
	},
	'settings.update_email': {
		en: 'UPDATE EMAIL',
		es: 'ACTUALIZAR CORREO',
		it: 'AGGIORNA EMAIL'
	},
	'settings.new_email': {
		en: 'New Email Address',
		es: 'Nueva dirección de correo',
		it: 'Nuovo indirizzo email'
	},
	'settings.security': {
		en: 'SECURITY',
		es: 'SEGURIDAD',
		it: 'SICUREZZA'
	},
	'settings.current_password': {
		en: 'Current Password',
		es: 'Contraseña actual',
		it: 'Password attuale'
	},
	'settings.new_password': {
		en: 'New Password',
		es: 'Nueva contraseña',
		it: 'Nuova password'
	},
	'settings.confirm_password': {
		en: 'Confirm Password',
		es: 'Confirmar contraseña',
		it: 'Conferma password'
	},
	'settings.update_password': {
		en: 'UPDATE',
		es: 'ACTUALIZAR',
		it: 'AGGIORNA'
	},
	'settings.change_username': {
		en: 'CHANGE USERNAME',
		es: 'CAMBIAR NOMBRE DE USUARIO',
		it: 'CAMBIA NOME UTENTE'
	},
	'settings.change_email': {
		en: 'CHANGE EMAIL',
		es: 'CAMBIAR CORREO',
		it: 'CAMBIA EMAIL'
	},
	'settings.change_password': {
		en: 'CHANGE PASSWORD',
		es: 'CAMBIAR CONTRASEÑA',
		it: 'CAMBIA LA PASSWORD'
	},
	'settings.change_avatar': {
		en: 'CHANGE AVATAR',
		es: 'CAMBIAR AVATAR',
		it: 'CAMBIA AVATAR'
	},
	'settings.logout': {
		en: 'LOG OUT',
		es: 'CERRAR SESIÓN',
		it: 'DISCONNETTI'
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
,
	'app.title': {
		en: 'Mini Pong',
		es: 'Mini Pong',
		it: 'Mini Pong'
	},
	'menu.stats': {
		en: 'Stats',
		es: 'Estadísticas',
		it: 'Statistiche'
	},
	'menu.friends': {
		en: 'Friends',
		es: 'Amigos',
		it: 'Amici'
	},
	'menu.requests': {
		en: 'Requests',
		es: 'Solicitudes',
		it: 'Richieste'
	},
	'menu.play': {
		en: 'Play',
		es: 'Jugar',
		it: 'Gioca'
	},
	'settings.day_mode': {
		en: 'Night/Day Mode',
		es: 'Modo Noche/Día',
		it: 'Modalità Notte/Giorno'
	},
	'settings.change_board_theme': {
		en: 'Change Board Theme',
		es: 'Cambiar tema del tablero',
		it: 'Cambia tema della schermata'
	},
	'play.play_locally': {
		en: 'Play Locally',
		es: 'Jugar localmente',
		it: 'Gioca localmente'
	},
	'play.play_ai': {
		en: 'Play Against AI',
		es: 'Jugar contra la IA',
		it: 'Gioca contro l\'IA'
	},
	'play.play_online': {
		en: 'Play Online',
		es: 'Jugar en línea',
		it: 'Gioca online'
	},
	'tournament.create': {
		en: 'Create Tournament',
		es: 'Crear Torneo',
		it: 'Crea Torneo'
	},
	'tournament.find': {
		en: 'Find Tournament',
		es: 'Buscar Torneo',
		it: 'Cerca Torneo'
	},
	'modal.select_avatar': {
		en: 'Select Avatar',
		es: 'Seleccionar avatar',
		it: 'Seleziona avatar'
	},
	'theme.board': {
		en: 'Board Theme',
		es: 'Tema del tablero',
		it: 'Tema della schermata'
	},
	'theme.apply': {
		en: 'Apply',
		es: 'Aplicar',
		it: 'Applica'
	},
	'theme.classic': {
		en: 'Classic',
		es: 'Clásico',
		it: 'Classico'
	},
	'auth.dont_have_account': {
		en: "Don't have an account?",
		es: '¿No tienes una cuenta?',
		it: 'Non hai un account?'
	},
	'auth.already_have_account': {
		en: 'Already have an account?',
		es: '¿Ya tienes una cuenta?',
		it: 'Hai già un account?'
	},
	'auth.login_with_google': {
		en: 'Login with Google',
		es: 'Iniciar sesión con Google',
		it: 'Accedi con Google'
	},
	'form.submit': {
		en: 'Submit',
		es: 'Enviar',
		it: 'Invia'
	},
	'common.or': {
		en: '- OR -',
		es: '- O -',
		it: '- O -'
	},
	'request.send_match_request': {
		en: 'Send Match Request',
		es: 'Enviar solicitud de partida',
		it: 'Invia richiesta di partita'
	},
	'request.match_request': {
		en: 'Match Request',
		es: 'Solicitud de partida',
		it: 'Richiesta di partita'
	},
	'request.player_wants': {
		en: 'Player wants to play against you.',
		es: 'El jugador quiere jugar contra ti.',
		it: 'Il giocatore vuole giocare contro di te.'
	},
            
	'twofa.title': {
		en: 'Two-Factor Authentication',
		es: 'Autenticación de dos factores',
		it: 'Autenticazione a due fattori'
	},
	'twofa.enter_code': {
		en: 'Enter 2FA code',
		es: 'Introduce el código 2FA',
		it: 'Inserisci il codice 2FA'
	},
	'form.update': {
		en: 'Update',
		es: 'Actualizar',
		it: 'Aggiorna'
	},
	'common.close': {
		en: 'Close',
		es: 'Cerrar',
		it: 'Chiudi'
	},
            
	'common.exit': {
		en: 'Exit',
		es: 'Salir',
		it: 'Esci'
	},
            
	'stats.general_summary': {
		en: 'General Summary',
		es: 'Resumen general',
		it: 'Riepilogo generale'
	},
	'stats.game_modes': {
		en: 'Game Modes Details',
		es: 'Detalles de modos de juego',
		it: 'Dettagli modalità di gioco'
	},
	'stats.wins_losses': {
		en: 'Wins vs losses Chart',
		es: 'Gráfico de victorias vs derrotas',
		it: 'Grafico vittorie vs sconfitte'
	},
	'stats.match_history': {
		en: 'Match history',
		es: 'Historial de partidas',
		it: 'Cronologia partite'
	},
	'stats.matches': {
		en: 'Matches',
		es: 'Partidas',
		it: 'Partite'
	},
	'stats.win_rate': {
		en: 'Win rate',
		es: 'Tasa de victorias',
		it: 'Percentuale vittorie'
	},
	'stats.current_streak': {
		en: 'Current streak',
		es: 'Racha actual',
		it: 'Serie attuale'
	},
	'stats.best_streak': {
		en: 'Best streak',
		es: 'Mejor racha',
		it: 'Migliore serie'
	},
	'stats.local_played': {
		en: 'Local Played',
		es: 'Jugadas locales',
		it: 'Giocate locali'
	},
	'stats.local_won': {
		en: 'Local Won',
		es: 'Ganadas locales',
		it: 'Vinte locali'
	},
	'stats.online_played': {
		en: 'Online Played',
		es: 'Jugadas en línea',
		it: 'Giocate online'
	},
	'stats.online_won': {
		en: 'Online Won',
		es: 'Ganadas en línea',
		it: 'Vinte online'
	},
	'stats.tourn_played': {
		en: 'Tourn. Played',
		es: 'Torn. jugados',
		it: 'Torn. giocate'
	},
	'stats.tourn_won': {
		en: 'Tourn. Won',
		es: 'Torn. ganados',
		it: 'Torn. vinte'
	},
	'requests.no_game_requests': {
		en: 'No pending games requests.',
		es: 'No hay solicitudes de partida pendientes.',
		it: 'Nessuna richiesta di partita in sospeso.'
	},
	'requests.no_friend_requests': {
		en: 'No pending friend requests.',
		es: 'No hay solicitudes de amistad pendientes.',
		it: 'Nessuna richiesta di amicizia in sospeso.'
	},
	'requests.no_tournament_requests': {
		en: 'No pending tournament requests.',
		es: 'No hay solicitudes de torneo pendientes.',
		it: 'Nessuna richiesta di torneo in sospeso.'
	},
};


const LANGUAGE_COOKIE_KEY = 'preferred_language';

function setCookie(name: string, value: string, days = 365) {
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name: string): string | null {
	return document.cookie.split('; ').reduce((r, v) => {
		const parts = v.split('=');
		return parts[0] === name ? decodeURIComponent(parts[1]) : r;
	}, null as string | null);
}


let currentLanguage: Language = Language.EN;

export function initializeLanguage(): Language {
	const storedLang = getCookie(LANGUAGE_COOKIE_KEY);
	if (storedLang && ALL_LANGUAGES.indexOf(storedLang as Language) !== -1) {
		currentLanguage = storedLang as Language;
	} else {
		const browserLang = navigator.language.split('-')[0];
		if (ALL_LANGUAGES.indexOf(browserLang as Language) !== -1) {
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
	setCookie(LANGUAGE_COOKIE_KEY, lang);
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

const ALL_LANGUAGES: Language[] = [Language.EN, Language.ES, Language.IT];

export function createLanguageButton(config: LanguageButtonConfig = {}): HTMLElement {
	const {
		container,
		position = 'top-right',
		style = 'dropdown',
		className = ''
	} = config;
	
	const wrapper = document.createElement('div');
	wrapper.className = `language-switcher ${position} ${className}`;
	if (!container) {
		wrapper.style.cssText = getPositionStyles(position);
	} else {
		wrapper.style.cssText = '';
	}
	
	// Append wrapper to the DOM early so child creators can detect its context
	if (container) {
		container.appendChild(wrapper);
	} else {
		document.body.appendChild(wrapper);
	}

	if (style === 'dropdown') {
		createDropdownButton(wrapper);
	} else if (style === 'flags') {
		createFlagsButton(wrapper);
	} else {
		createTextButton(wrapper);
	}
	
	return wrapper;
}

function createDropdownButton(wrapper: HTMLElement): void {
	const button = document.createElement('button');
	// Always use the same classes as other settings buttons
	button.className = 'pong-button active-border full-width flex justify-between items-center language-btn';
	button.innerHTML = `☞ ${translate('settings.change_language')}`;

	const dropdown = document.createElement('div');
	dropdown.className = 'language-dropdown';
	dropdown.style.cssText = `
		position: static;
		margin-top: 8px;
		background: #fff;
		border: 2px solid #333;
		border-radius: 4px;
		display: none;
		width: 100%;
		box-shadow: none;
		z-index: 1000;
	`;

	ALL_LANGUAGES.forEach((lang) => {
		const option = document.createElement('button');
		option.className = 'language-option';
		option.innerHTML = `${languageFlags[lang]} ${languageNames[lang]}`;
		option.style.cssText = `
			width: 100%;
			padding: 10px 16px;
			border: none;
			background: #fff;
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
			option.style.background = '#fff';
		});
		option.addEventListener('click', () => {
			changeLanguage(lang);
			button.innerHTML = `☞ ${translate('settings.change_language')}`;
			dropdown.style.display = 'none';
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

	// Close dropdown on outside click
	document.addEventListener('click', () => {
		dropdown.style.display = 'none';
	});

	wrapper.appendChild(button);
	wrapper.appendChild(dropdown);
}

function createFlagsButton(wrapper: HTMLElement): void {
	wrapper.style.cssText += 'display: flex; gap: 8px;';
	
	ALL_LANGUAGES.forEach((lang) => {
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
				const btnLang = ALL_LANGUAGES[idx];
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
	
	ALL_LANGUAGES.forEach((lang) => {
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
				const isActive = ALL_LANGUAGES[idx] === lang;
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
