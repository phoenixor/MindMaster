import { useI18n } from 'vue-i18n'

export default function useTranslation() {
  const { t } = useI18n()
  return t
}
