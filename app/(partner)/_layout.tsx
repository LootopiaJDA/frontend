import { Colors } from '../../constants/theme';
import RoleTabLayout from '../../components/RoleTabLayout';

const TABS = [
    { name: 'dashboard', title: 'Dashboard', icon: require('../../assets/images/dashboard.png') },
    { name: 'profil', title: 'Profil', icon: require('../../assets/images/profil.png') },
];

export default function PartnerLayout() {
    return (
        <RoleTabLayout
            allowedRole="PARTENAIRE"
            redirectTo="/(app)/chasses"
            accentColor={Colors.gold}
            tabBarHeight={110}
            tabs={TABS}
            hiddenScreens={[
                '(components)/add-etape',
                '(components)/chasse-detail',
                '(components)/edit-etape',
            ]}
        />
    );
}
