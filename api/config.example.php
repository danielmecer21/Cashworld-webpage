<?php
// Copy this file to config.php and enter the values from cPanel.
// Never commit config.php or share it publicly.
return [
    'db_host' => 'localhost',
    'db_name' => 'CPANEL_DATABASE_NAME',
    'db_user' => 'CPANEL_DATABASE_USER',
    'db_pass' => 'YOUR_DATABASE_PASSWORD',
    'admin_email' => 'admin@cashworld.co.zw',
    // Generate with: php -r "echo password_hash('YOUR-STRONG-PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
    'admin_password_hash' => 'REPLACE_WITH_PASSWORD_HASH',
    'session_name' => 'cashworld_admin',
];
