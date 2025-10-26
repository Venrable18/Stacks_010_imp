
;;Use the FT trait
(use-trait ft-trait .ft-trait.ft-trait)

;; Implement the SIP-010 trait
(impl-trait .ft-trait.ft-trait)

(define-fungible-token VEN_token u1000000000000000)

;;Define constants
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))
(define-constant ERR_NOT_TOKEN_OWNER (err u102))
(define-constant ERR_INSUFFICIENT_BALANCE (err u103))
(define-constant contract-owner tx-sender)
(define-constant TOKEN_NAME "VEN Token")
(define-constant TOKEN_SYMBOL "VT")
(define-constant TOKEN_DECIMAL u18)

;; SIP-010 Standard Functions

;; Transfer function (SIP-010 compliant)
(define-public (transfer (amount uint) (sender principal) (recipient principal))
    (begin 
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
        (asserts! (is-standard recipient) ERR_UNAUTHORIZED)
        (try! (ft-transfer? VEN_token amount sender recipient))
        (ok true)
    )
)

;; Get token name
(define-read-only (get-name)
    (ok TOKEN_NAME)
)

;; Get token symbol
(define-read-only (get-symbol)
    (ok TOKEN_SYMBOL)
)

;; Get token decimals
(define-read-only (get-decimals)
    (ok TOKEN_DECIMAL)
)

;; Get balance
(define-read-only (get-balance (who principal)) 
    (ok (ft-get-balance VEN_token who))
)

;; Get total supply
(define-read-only (get-total-supply)
    (ok (ft-get-supply VEN_token))
)

;; Get token URI (optional metadata)
(define-read-only (get-token-uri)
    (ok none)
)

;; Additional helper functions

;; Transfer tokens (alternative function name for convenience) 
(define-public (transfer-token (amount uint) (recipient principal)) 
    (begin
        ;; Validate recipient to prevent unchecked data warning
        (asserts! (is-standard recipient) ERR_UNAUTHORIZED)
        (transfer amount tx-sender recipient)
    )
)

;; Mint tokens (only contract owner can mint)
(define-public (mint (amount uint) (recipient principal)) 
    (begin 
        (asserts! (is-eq tx-sender contract-owner) ERR_UNAUTHORIZED)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        ;; Validate recipient to prevent unchecked data warning
        (asserts! (is-standard recipient) ERR_UNAUTHORIZED)
        (ft-mint? VEN_token amount recipient)
    )
)




