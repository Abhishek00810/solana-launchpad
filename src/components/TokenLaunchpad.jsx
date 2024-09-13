import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID,getAssociatedTokenAddressSync,createMintToInstruction, createAssociatedTokenAccountInstruction,getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


export function TokenLaunchpad() {
    const {connection} = useConnection();
    const wallet = useWallet();
    async function CreateToken()
    {
        
        const mintkeypair = Keypair.generate();
        const metadata = {
            mint: mintkeypair.publicKey,
            name: 'ABHI',
            symbol: 'AD',
            uri: 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata: [],
        }

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintkeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintkeypair.publicKey, wallet.publicKey, mintkeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintkeypair.publicKey, 6, wallet.publicKey, wallet.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintkeypair.publicKey,
                metadata: mintkeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            })
        );
       
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintkeypair);

        await wallet.sendTransaction(transaction, connection);
        console.log(`Token mint created at ${mintkeypair.publicKey.toBase58()}`);

        const associatedToken = getAssociatedTokenAddressSync(
            mintkeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(associatedToken.toBase58());

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintkeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        )

        await wallet.sendTransaction(transaction2, connection);

        const transaction3 = new Transaction().add(
            createMintToInstruction(mintkeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);

        console.log("Minted!")
    }
    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name'></input> <br />
        <input className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button className='btn' onClick={CreateToken}>Create a token</button>
    </div>
}