echo "decrypt secrets"

openssl aes-256-cbc -K $encrypted_dd6f15d73ffd_key -iv $encrypted_dd6f15d73ffd_iv -in travis_rsa.enc -out travis_rsa -d
chmod 600 travis_rsa
