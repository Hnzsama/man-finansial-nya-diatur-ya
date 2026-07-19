import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <AppLogoIcon className="size-6 fill-current text-black dark:text-white" />
            <span className="truncate leading-tight font-bold text-lg text-black dark:text-white">
                Man Finance
            </span>
        </div>
    );
}
