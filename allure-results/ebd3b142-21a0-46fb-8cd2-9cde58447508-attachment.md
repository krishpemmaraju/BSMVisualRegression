# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - generic:
      - generic:
        - generic:
          - img "Organization background image" [ref=e2]
          - generic [ref=e4]:
            - generic [ref=e10]:
              - img "Organization banner logo" [ref=e13]
              - main [ref=e14]:
                - generic [ref=e17]:
                  - heading "We couldn't sign you in" [level=1] [ref=e18]
                  - alert [ref=e21]: Something went wrong when trying to sign in with a passkey. Please try again.
                  - generic [ref=e22]:
                    - generic [ref=e25]:
                      - link "Learn more about passkeys" [ref=e27] [cursor=pointer]:
                        - /url: https://aka.ms/NeedHelpPasskeys
                      - link "Sign in another way" [ref=e29] [cursor=pointer]:
                        - /url: "#"
                    - generic [ref=e30]:
                      - button "Back" [ref=e32] [cursor=pointer]
                      - button "Try again" [ref=e34] [cursor=pointer]
            - contentinfo [ref=e35]:
              - generic [ref=e36]:
                - link "Terms of use" [ref=e37] [cursor=pointer]:
                  - /url: https://www.microsoft.com/en-US/servicesagreement/
                - link "Privacy & cookies" [ref=e38] [cursor=pointer]:
                  - /url: https://privacy.microsoft.com/en-US/privacystatement
                - button "Click here for troubleshooting information" [ref=e39] [cursor=pointer]: ...
```