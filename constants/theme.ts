// ─────────────────────────────────────────────────────────────────────────────
// PALETTE PRIMITIVE
// Changez ces valeurs pour modifier toute la palette en cascade.
// ─────────────────────────────────────────────────────────────────────────────
export const Colors = {
  bg:            '#14110F',
  bgCard:        '#2A241D',
  bgElevated:    '#332B22',
  bgInput:       '#d8d4d1',

  border:        '#5A4A32',
  borderLight:   '#6B5A3A',
  borderWarm:    '#7A5225',

  gold:          '#E0A93A',
  goldLight:     '#F2C14E',
  goldDim:       '#E0A93A33',
  goldGlow:      '#E0A93A22',

  amber:         '#D97706',
  parchment:     '#C8A96E',

  accent:        '#6C63FF',
  accentLight:   '#8A84FF',

  success:       '#48BB78',
  successBg:     '#48BB7833',

  error:         '#ff0000',
  errorBg:       'rgba(128,17,17)',

  warning:       '#ED8936',
  warningBg:     '#ED893633',

  textPrimary:   '#FFF6E5',
  textSecondary: '#E2D3B0',
  textTertiary: '#e10c0c',
  textMuted:     '#B8A98A',

  statusActive:  '#4ecb8a',

  white:         '#FFFFFF',
  black:         '#000000',
};

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS SÉMANTIQUES  ←  MODIFIEZ ICI POUR CHANGER UN ÉLÉMENT PRÉCIS
// Chaque token pointe vers un Color primitif. Changer un token ne touche
// qu'aux composants qui l'utilisent, pas aux autres usages de la même couleur.
// ─────────────────────────────────────────────────────────────────────────────
export const Design = {

  // ── Textes ────────────────────────────────────────────────────────────────
  text: {
    heading:   Colors.textPrimary,    // titres principaux, noms
    body:      Colors.textPrimary,    // contenu, descriptions
    label:     Colors.textSecondary,  // labels formulaires, sous-titres section
    meta:      Colors.textMuted,      // IDs, timestamps, métadonnées
    accent:    Colors.gold,           // liens, or, mises en valeur
    warm:      Colors.textTertiary,          // noms société, accents chauds
    danger:    Colors.error,
    success:   Colors.success,
    warning:   Colors.warning,
    onSolid:   Colors.black,         // texte sur fond coloré (bouton or)
    parchment: Colors.parchment,     // texte spécial welcome
  },

  // ── Fonds ─────────────────────────────────────────────────────────────────
  bg: {
    screen:   Colors.bg,
    card:     Colors.bgCard,
    elevated: Colors.bgElevated,
    input:    Colors.bgInput,
    modal:    Colors.bg,
    overlay:  'rgba(10,7,0,0.65)',
    glass:    'rgba(255,255,255,0.08)',
    danger:   Colors.errorBg,
    success:  Colors.successBg,
    warning:  Colors.warningBg,
    gold:     Colors.goldGlow,
    active:   '#4ecb8a18',
  },

  // ── Bordures ──────────────────────────────────────────────────────────────
  border: {
    default: Colors.border,
    warm:    Colors.borderWarm,
    light:   Colors.borderLight,
    focus:   Colors.gold,
    error:   Colors.error,
    success: Colors.success,
    warning: Colors.warning,
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  input: {
    bg:          Colors.bgInput,
    border:      Colors.border,
    borderFocus: Colors.gold,
    borderError: Colors.error,
    text:        Colors.black,        // texte saisi (sur fond clair)
    placeholder: Colors.textMuted,
    label:       Colors.textSecondary,
    icon:        Colors.textMuted,
    iconFocus:   Colors.gold,
  },

  // ── Boutons ───────────────────────────────────────────────────────────────
  button: {
    primary:  { bg: Colors.gold,       text: Colors.black,         border: Colors.gold },
    secondary:{ bg: Colors.bgElevated, text: Colors.textPrimary,   border: Colors.borderLight },
    ghost:    { bg: Colors.goldGlow,   text: Colors.gold,          border: Colors.gold + '55' },
    danger:   { bg: Colors.errorBg,    text: Colors.error,         border: Colors.error + '55' },
    outline:  { bg: 'transparent',     text: Colors.textSecondary, border: Colors.border },
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    bg:            Colors.bgCard,
    border:        Colors.borderWarm,
    bgPending:     Colors.warningBg,
    borderPending: Colors.warning,
  },

  // ── Avatar ────────────────────────────────────────────────────────────────
  avatar: {
    bg:     Colors.bgElevated,
    border: Colors.borderWarm,
    text:   Colors.gold,
  },

  // ── Statuts / Badges ──────────────────────────────────────────────────────
  // label = texte affiché, color = couleur du point + texte, bg = fond du badge
  status: {
    ACTIVE:       { label: 'Active',       color: Colors.statusActive, bg: '#4ecb8a18' },
    PENDING:      { label: 'En attente',   color: Colors.warning,      bg: Colors.warningBg },
    COMPLETED:    { label: 'Terminée',     color: Colors.textMuted,    bg: Colors.border },
    VERIFICATION: { label: 'Vérification', color: Colors.warning,      bg: Colors.warningBg },
    INACTIVE:     { label: 'Inactif',      color: Colors.error,        bg: Colors.errorBg },
    JOUEUR:       { label: 'Joueur',       color: Colors.accentLight,  bg: Colors.accent + '22' },
    PARTENAIRE:   { label: 'Partenaire',   color: Colors.gold,         bg: Colors.goldGlow },
    ADMIN:        { label: 'Admin',        color: Colors.error,        bg: Colors.errorBg },
  },

  // ── Section header ────────────────────────────────────────────────────────
  section: {
    title: Colors.gold,
    sub:   Colors.textSecondary,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modal: {
    bg:        Colors.bg,
    border:    Colors.borderWarm,
    title:     Colors.textPrimary,
    closeIcon: Colors.textSecondary,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHIE & ESPACEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const Fonts = {
  display: 'Cinzel_900Black',
  title:   'Cinzel_700Bold',
};

export const Sp = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const R = {
  xs: 4, sm: 8, md: 12, lg: 18, xl: 24, full: 9999,
};
