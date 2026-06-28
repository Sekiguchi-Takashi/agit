// チェックリストの設定項目データ
// levels: その項目が高/中/低の各セキュリティレベルで標準的にONになるかどうか

const CATEGORY_LABELS = {
  account: 'アカウント・サインイン',
  security: 'セキュリティ',
  privacy: 'プライバシー',
  system: 'システム・運用',
};

const CATEGORY_ORDER = ['account', 'security', 'privacy', 'system'];

const SECURITY_LEVEL_LABELS = {
  high: 'セキュリティレベル: 高',
  medium: 'セキュリティレベル: 中',
  low: 'セキュリティレベル: 低',
  custom: 'カスタム設定',
};

const CHECKLIST_ITEMS = [
  {
    id: 'local-account',
    category: 'account',
    title: 'Microsoftアカウントを使わずローカルアカウントでセットアップ',
    summary: 'OOBE(初期セットアップ)画面でネットワーク接続をスキップし、ローカルアカウントを作成します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      'PCの初期セットアップ画面(OOBE)でネットワーク接続画面が表示されたら、Shift + F10 キーを押してコマンドプロンプトを開きます。',
      'コマンドプロンプトに「OOBE\\BYPASSNRO」と入力してEnterキーを押します。PCが自動的に再起動します。',
      '再起動後、再度ネットワーク接続画面が表示されたら「インターネットに接続していません」を選択します。',
      '「制限された設定で続行」を選択し、ローカルアカウントのユーザー名とパスワードを設定します。',
    ],
  },
  {
    id: 'strong-password',
    category: 'account',
    title: 'ローカル管理者パスワードの強化',
    summary: 'ローカル管理者アカウントに十分な強度のパスワードを設定します。',
    levels: { high: true, medium: true, low: false },
    steps: [
      'スタート → 設定 → アカウント → サインインオプション を開きます。',
      '「パスワード」を選択し「変更」をクリックします。',
      '12文字以上で、英大文字・英小文字・数字・記号を組み合わせた強固なパスワードを設定します。',
      '必要に応じて secpol.msc (ローカルセキュリティポリシー) でパスワードの有効期限や複雑性のポリシーを設定します。',
    ],
  },
  {
    id: 'windows-update',
    category: 'security',
    title: 'Windows Update の自動更新設定',
    summary: 'セキュリティ更新が確実に適用されるよう更新設定を確認します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      '設定 → Windows Update を開きます。',
      '「詳細オプション」を開きます。',
      '「更新を一時停止しない」ことを確認し、必要に応じて「アクティブ時間」を業務時間に合わせて設定します。',
      '「他のMicrosoft製品の更新を受け取る」をオンにしておくことを推奨します。',
    ],
  },
  {
    id: 'defender-check',
    category: 'security',
    title: 'Windows Defender ウイルス対策の確認',
    summary: 'リアルタイム保護などの基本的なウイルス対策機能が有効か確認します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      '設定 → プライバシーとセキュリティ → Windowsセキュリティ を開きます。',
      '「ウイルスと脅威の防止」を選択します。',
      '「リアルタイム保護」がオンになっていることを確認します。',
      '「クラウド配信保護」「自動サンプル送信」もオンにしておくことを推奨します。',
    ],
  },
  {
    id: 'firewall-check',
    category: 'security',
    title: 'Windowsファイアウォールの設定確認',
    summary: 'パブリック/プライベート/ドメインの各プロファイルでファイアウォールが有効か確認します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      'Windowsセキュリティ → 「ファイアウォールとネットワーク保護」を開きます。',
      'パブリック・プライベート・ドメインの各ネットワークプロファイルがオンになっていることを確認します。',
      '利用しない受信規則がある場合は「詳細設定」から無効化します。',
    ],
  },
  {
    id: 'bitlocker',
    category: 'security',
    title: 'BitLocker ドライブ暗号化の有効化',
    summary: 'OSドライブを暗号化し、PCの盗難・紛失時の情報漏えいを防ぎます。',
    levels: { high: true, medium: false, low: false },
    steps: [
      'コントロールパネル → システムとセキュリティ → BitLocker ドライブ暗号化 を開きます。',
      '対象ドライブ(通常はCドライブ)で「BitLockerを有効にする」をクリックします。',
      '回復キーの保存方法を選択します。Microsoftアカウントに紐づけない場合は「USBフラッシュドライブに保存」または「ファイルに保存(社内の安全な場所に保管)」を選びます。',
      '暗号化するドライブ容量(使用領域のみ/ドライブ全体)と暗号化モードを選び、暗号化を開始します。',
    ],
  },
  {
    id: 'smartscreen-check',
    category: 'security',
    title: 'SmartScreen フィルターの有効化確認',
    summary: '不審なアプリやサイトを警告するSmartScreen機能を確認します。',
    levels: { high: true, medium: true, low: false },
    steps: [
      'Windowsセキュリティ → 「アプリとブラウザーコントロール」を開きます。',
      '「評価に基づく保護の設定」を開きます。',
      '「アプリとファイルのチェック」「Microsoft Edge用SmartScreen」「悪意のあるアプリの動作の検出」をすべてオンにします。',
    ],
  },
  {
    id: 'remote-desktop-disable',
    category: 'security',
    title: 'リモートデスクトップの無効化',
    summary: '不要なリモートアクセス経路をなくし、攻撃対象領域を減らします。',
    levels: { high: true, medium: true, low: false },
    steps: [
      '設定 → システム → リモートデスクトップ を開きます。',
      '「リモートデスクトップ」のトグルをオフにします。',
      '業務上リモート操作が必要な場合は、VPN経由など別の安全な手段を検討してください。',
    ],
  },
  {
    id: 'guest-account-check',
    category: 'security',
    title: 'ゲストアカウントの無効化確認',
    summary: '不要なゲストアカウントが有効になっていないか確認します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      'コマンドプロンプト(管理者として実行)で「net user」と入力し、アカウント一覧を確認します。',
      'Guestアカウントが有効な場合、「net user guest /active:no」と入力して無効化します。',
    ],
  },
  {
    id: 'tpm-secureboot-check',
    category: 'security',
    title: 'TPM / セキュアブートの状態確認',
    summary: 'Windows 11の必須要件であるTPM2.0とセキュアブートが有効か確認します。',
    levels: { high: true, medium: true, low: false },
    steps: [
      'ファイル名を指定して実行(Win+R)で「tpm.msc」と入力し、TPMが準備完了(バージョン2.0以上)か確認します。',
      'ファイル名を指定して実行で「msinfo32」と入力し、システム情報の「セキュアブートの状態」が「有効」になっているか確認します。',
      '無効な場合はPC再起動時にBIOS/UEFI設定を開き、セキュアブートとTPMを有効化します。',
    ],
  },
  {
    id: 'autoplay-disable',
    category: 'security',
    title: '自動再生(AutoPlay)の無効化',
    summary: 'USBメモリ等の外部メディア接続時の自動実行による感染リスクを減らします。',
    levels: { high: true, medium: false, low: false },
    steps: [
      '設定 → Bluetoothとデバイス → 自動再生 を開きます。',
      '「すべてのメディアやデバイスに自動再生を使う」をオフにします。',
    ],
  },
  {
    id: 'network-sharing',
    category: 'security',
    title: 'ネットワーク検出・ファイル共有設定の見直し',
    summary: '不要なファイル共有・ネットワーク検出を無効化し情報漏えいリスクを減らします。',
    levels: { high: true, medium: false, low: false },
    steps: [
      '設定 → ネットワークとインターネット → 詳細なネットワーク設定 → 「高度な共有設定」を開きます。',
      'パブリックネットワークでは「ネットワーク検出」「ファイルとプリンターの共有」をオフにします。',
      'プライベートネットワークでも、業務上不要であればオフにします。',
    ],
  },
  {
    id: 'diagnostic-data',
    category: 'privacy',
    title: '診断データ(テレメトリ)送信レベルの設定',
    summary: 'Microsoftへ送信する診断データを必要最小限に絞ります。',
    levels: { high: true, medium: true, low: false },
    steps: [
      '設定 → プライバシーとセキュリティ → 診断とフィードバック を開きます。',
      '「診断データの送信」を「必須の診断データ」に設定します。',
      '「フィードバックの頻度」を「自動的に決定」または最小限の頻度に設定します。',
    ],
  },
  {
    id: 'ad-id',
    category: 'privacy',
    title: '広告IDの無効化',
    summary: '広告のパーソナライズに使われる広告IDをオフにします。',
    levels: { high: true, medium: true, low: false },
    steps: [
      '設定 → プライバシーとセキュリティ → 全般 を開きます。',
      '「広告IDを使用してアプリでより適切な広告を表示できるようにする」をオフにします。',
    ],
  },
  {
    id: 'activity-history',
    category: 'privacy',
    title: 'アクティビティ履歴の無効化',
    summary: 'デバイス上の操作履歴の収集・送信を停止します。',
    levels: { high: true, medium: true, low: false },
    steps: [
      '設定 → プライバシーとセキュリティ → アクティビティの履歴 を開きます。',
      '「このデバイスにアクティビティの履歴を保存する」をオフにします。',
    ],
  },
  {
    id: 'location-disable',
    category: 'privacy',
    title: '位置情報サービスの無効化',
    summary: '業務利用で不要な位置情報の取得を停止します。',
    levels: { high: true, medium: false, low: false },
    steps: [
      '設定 → プライバシーとセキュリティ → 位置情報 を開きます。',
      '「位置情報サービス」のトグルをオフにします。',
    ],
  },
  {
    id: 'onedrive-disable',
    category: 'privacy',
    title: 'OneDrive自動同期・自動起動の無効化',
    summary: '個人クラウドへの意図しないデータ同期を防ぎます。',
    levels: { high: true, medium: true, low: false },
    steps: [
      'タスクバーのOneDriveアイコンをクリックし、設定(歯車アイコン)→ 設定 を開きます。',
      '「アカウント」タブで「このPCのリンクを解除」をクリックします。',
      '「設定」タブで「Windowsへのサインイン時にOneDriveを自動的に起動する」をオフにします。',
    ],
  },
  {
    id: 'remove-bloatware',
    category: 'system',
    title: '不要なプリインストールアプリの削除',
    summary: '業務で使わないプリインストールアプリ(ゲーム、体験版アプリ等)を削除します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      '設定 → アプリ → インストールされているアプリ を開きます。',
      '業務で使わないアプリを一覧から選び「アンインストール」をクリックします。',
      '対象アプリすべてに対して繰り返します。',
    ],
  },
  {
    id: 'lock-screen-timeout',
    category: 'system',
    title: '画面ロック/スリープのタイムアウト設定',
    summary: '離席時に自動で画面ロックがかかるよう設定します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      '設定 → システム → 電源とバッテリー → 「画面とスリープ」を開きます。',
      '画面オフ・スリープまでの時間を組織のポリシーに合わせて設定します(例:5分)。',
      '設定 → 個人用設定 → ロック画面 → 「スクリーンセーバー設定」で「再開時にログオン画面を表示する」を有効化します。',
    ],
  },
  {
    id: 'windows-hello-pin',
    category: 'system',
    title: 'Windows Hello / PIN サインインの設定',
    summary: 'パスワード入力に代わる安全なサインイン方法を設定します。',
    levels: { high: true, medium: true, low: true },
    steps: [
      '設定 → アカウント → サインインオプション を開きます。',
      '「PIN(Windows Hello)」を選択し「追加」をクリックします。',
      '現在のローカルアカウントのパスワードを入力し、新しいPINを設定します。',
    ],
  },
];
