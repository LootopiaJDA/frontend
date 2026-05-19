import { Colors } from '../../constants/theme';
import RoleTabLayout from '../../components/RoleTabLayout';

const TABS = [
    { name: 'dashboard', title: 'Dashboard', icon: require('../../assets/images/dashboard.png') },
    { name: 'users', title: 'Utilisateurs', icon: require('../../assets/images/plus.png') },
    { name: 'chasses', title: 'Chasses', icon: require('../../assets/images/chasse.png') },
    { name: 'profil', title: 'Profil', icon: require('../../assets/images/profil.png') },
];

export default function AdminLayout() {
    return (
        <RoleTabLayout
            allowedRole="ADMIN"
            redirectTo="/(app)/chasses"
            accentColor={Colors.error}
            tabs={TABS}
        />
    );
}
