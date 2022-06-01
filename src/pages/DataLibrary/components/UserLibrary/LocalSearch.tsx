import React, { useContext } from 'react';
import { TextInput, Button, Spinner } from '@patternfly/react-core'
import { searchUploadedFiles, searchFeedFiles, searchPacsFiles, handleUploadedFiles, handleFeedFiles, handlePacsFiles } from './utils'
import { LibraryContext } from './context';
const LocalSearch = ({
    type,
    username
}: {
    type: string,
    username: null | undefined | string
}) => {
    const [value, setValue] = React.useState('');
    const { dispatch } = useContext(LibraryContext)
    const [loading, setLoading] = React.useState(false)

    const handleChange = (value: string) => {
        setValue(value);
    }

    const handleSubmit = async () => {
        if (value && username) {
            if (type === 'uploads') {
                setLoading(true)
                const uploadedFiles = await searchUploadedFiles(
                    value,
                    `${username}/uploads`,
                )

                if (uploadedFiles && uploadedFiles.length > 0) {
                    handleUploadedFiles(uploadedFiles, dispatch, value)
                }
                setLoading(false)
            }
            if (type === 'feed') {
                setLoading(true)
                const feedFiles = await searchFeedFiles(value, username)

                if (feedFiles && feedFiles.length > 0) {
                    handleFeedFiles(feedFiles, dispatch, username)
                }
                setLoading(false)
            }
            if (type === 'services') {
                setLoading(true)
                const pacsFiles = await searchPacsFiles(value, '')


                if (pacsFiles && pacsFiles.length > 0) {
                    handlePacsFiles(pacsFiles, dispatch,)
                }
                setLoading(false)
            }
        }
    }
    return (
        <>
            <div style={{
                width: '30%',
                display: 'flex',
                marginLeft: 'auto'
            }}>
                <TextInput style={{
                    marginRight: '1em'
                }} value={value} onChange={handleChange} />
                <Button onClick={handleSubmit}>Search</Button>

            </div>
            {
                loading && (
                    <div
                        style={{
                            marginTop: '1em',
                        }}
                    >
                        <Spinner
                            style={{
                                marginRight: '1em',
                            }}
                            size="md"
                        />
                        <span>Fetching Search Results....</span>
                    </div>
                )
            }
        </>

    )
}

export default LocalSearch;