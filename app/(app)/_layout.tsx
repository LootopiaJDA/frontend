import { Colors } from '../../constants/theme';
import RoleTabLayout from '../../components/RoleTabLayout';

const TABS = [
    { name: 'dashboard', title: 'Accueil', icon: require('../../assets/images/dashboard.png') },
    { name: 'chasses', title: 'Chasses', icon: require('../../assets/images/chasse.png') },
    { name: 'map', title: 'Carte', icon: require('../../assets/images/carte.png') },
    { name: 'profil', title: 'Profil', icon: require('../../assets/images/profil.png') },
];

export default function AppLayout() {
    return (
        <RoleTabLayout
            allowedRole="JOUEUR"
            redirectTo="/(auth)/login"
            accentColor={Colors.gold}
            tabs={TABS}
            hiddenScreens={['chasse/[id]', 'ar-view', 'resultats']}
        />
    );
}
