import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import * as ScratchBlocks from 'scratch-blocks';
import {defineMessage, useIntl} from 'react-intl';

import Filter from '../filter/filter.jsx';
import styles from './ai-panel.css';

const placeholderMessage = defineMessage({
    id: 'gui.ai.search.placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder for hidden AI search bar'
});

import React, {useMemo, useState, useCallback} from 'react';
import * as ScratchBlocks from 'scratch-blocks';

import styles from './ai-panel.css';

const SYSTEM_PROMPT = [
    'You are an assistant that converts natural language into Scratch 3.0 blocks.',
    'Rules:',
    '- Output ONLY valid JSON',
    '- No explanation',
    '- Use Scratch opcode format',
    '- If user asks for a runnable script, include event_whenflagclicked as the first block.',
    '- Response format: {"blocks": [{"opcode": "event_whenflagclicked"}, {"opcode": "motion_movesteps", "inputs": {"STEPS": 10}}]}'
].join('\n');

const getErrorMessage = error => (error instanceof Error ? error.message : String(error));

const xmlEscape = value => String(value)
    '- Response format: {"blocks": [{"opcode": "event_whenflagclicked"},',
    '{"opcode": "motion_movesteps", "inputs": {"STEPS": 10}}]}'
].join('\n');

const getErrorMessage = (error) => (error instanceof Error ? error.message : String(error));

const xmlEscape = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const createShadow = (name, value) => {
    if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(String(value))) {
        return `<value name="${xmlEscape(name)}"><shadow type="math_number"><field name="NUM">${xmlEscape(value)}</field></shadow></value>`;
    }
    return `<value name="${xmlEscape(name)}"><shadow type="text"><field name="TEXT">${xmlEscape(value)}</field></shadow></value>`;
};

const normalizeAiJson = text => {
    const textValue = Number.isFinite(Number(value)) ? Number(value) : value;
    return `<value name="${xmlEscape(name)}"><shadow type="math_number"><field name="NUM">${xmlEscape(textValue)}</field></shadow></value>`;
};

const normalizeAiJson = (text) => {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenceMatch ? fenceMatch[1] : text;
    return JSON.parse(body);
};

const ensureGreenFlagScript = blocks => {
    if (blocks.length === 0) return blocks;
    if (blocks[0]?.opcode === 'event_whenflagclicked') return blocks;
    return [{opcode: 'event_whenflagclicked'}, ...blocks];
};

const buildWorkspaceXml = blocks => {
    const normalizedBlocks = ensureGreenFlagScript(blocks);
    const validBlocks = normalizedBlocks.filter(block => block?.opcode);
    if (!validBlocks.length) {
        throw new Error('AI response JSON does not include any valid blocks.');
    }

    const [first, ...rest] = validBlocks;
    const toBlockXml = block => {
        const inputXml = Object.entries(block.inputs || {})
            .map(([key, value]) => createShadow(key, value))
            .join('');
        return `<block type="${xmlEscape(block.opcode)}">${inputXml}</block>`;
    };

    let scriptXml = `<block x="24" y="24" type="${xmlEscape(first.opcode)}">${
        Object.entries(first.inputs || {}).map(([k, v]) => createShadow(k, v)).join('')
    }</block>`;
    rest.forEach(block => {
        scriptXml = scriptXml.replace('</block>', `<next>${toBlockXml(block)}</next></block>`);
    });

    return `<xml xmlns="http://www.w3.org/1999/xhtml">${scriptXml}</xml>`;
const buildWorkspaceXml = (blocks) => {
    const blockXml = [];
    let currentX = 20;

    blocks.forEach((block, index) => {
        if (!block?.opcode) {
            return;
        }

        const inputXml = Object.entries(block.inputs || {})
            .map(([key, value]) => createShadow(key, value))
            .join('');

        if (index === 0 || block.opcode.startsWith('event_')) {
            blockXml.push(
                `<block type="${xmlEscape(block.opcode)}" x="${currentX}" y="${20 + (index * 110)}">` +
                `${inputXml}</block>`
            );
            currentX += 36;
            return;
        }

        const previous = blockXml.pop();
        blockXml.push(previous.replace('</block>', `<next><block type="${xmlEscape(block.opcode)}">${inputXml}</block></next></block>`));
    });

    return `<xml xmlns="http://www.w3.org/1999/xhtml">${blockXml.join('')}</xml>`;
};

const AIPanel = ({apiUrl}) => {
    const [prompt, setPrompt] = useState('Make sprite move 10 steps when green flag clicked');
    const [statusText, setStatusText] = useState('');
    const [loading, setLoading] = useState(false);
    const intl = useIntl();

    const endpoint = useMemo(() => `${apiUrl.replace(/\/$/, '')}/ai`, [apiUrl]);

    const applyBlocks = useCallback(aiText => {
        const parsed = normalizeAiJson(aiText);
        const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
        const xmlText = buildWorkspaceXml(blocks);
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);

    const endpoint = useMemo(() => `${apiUrl.replace(/\/$/, '')}/ai`, [apiUrl]);

    const applyBlocks = (aiText) => {
        const parsed = normalizeAiJson(aiText);
        const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];

        if (!blocks.length) {
            throw new Error('AI response JSON does not include any blocks.');
        }

        const workspace = ScratchBlocks.getMainWorkspace();
        if (!workspace) {
            throw new Error('Scratch workspace is not ready yet.');
        }

        const dom = ScratchBlocks.utils.xml.textToDom(xmlText);
        ScratchBlocks.clearWorkspaceAndLoadFromXml(dom, workspace);

        setStatusText('AI generated blocks. Click green flag to run.');
    }, []);

    const onChange = useCallback(event => {
        setPrompt(event.target.value);
    }, []);

    const onClear = useCallback(() => {
        setPrompt('');
        setStatusText('');
    }, []);

    const onSearch = useCallback(async () => {
        if (!prompt.trim()) {
            setStatusText('Please enter a request first.');
            return;
        }

        const xmlText = buildWorkspaceXml(blocks);
        const dom = ScratchBlocks.utils.xml.textToDom(xmlText);
        ScratchBlocks.clearWorkspaceAndLoadFromXml(dom, workspace);

        return parsed;
    };

    const clearOutput = useCallback(() => {
        setResponseText('');
    }, []);

    const onPromptChange = useCallback((event) => {
        setPrompt(event.target.value);
    }, []);

    const sendPrompt = useCallback(async () => {
        setLoading(true);
        try {
            const composedPrompt = `${SYSTEM_PROMPT}\n\nUser request:\n${prompt}`;
            const request = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt: composedPrompt})
            });

            const data = await request.json();
            if (!request.ok) {
                throw new Error(data.error || 'AI request failed');
            }
            applyBlocks(data.text);
        } catch (error) {
            setStatusText(`Error: ${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [applyBlocks, endpoint, prompt]);

    return (
        <div className={styles.wrapper}>
            <Filter
                className={styles.search}
                filterQuery={prompt}
                onChange={onChange}
                onClear={onClear}
                placeholderText={intl.formatMessage(placeholderMessage)}
            />
            <button
                className={styles.searchButton}
                disabled={loading}
                onClick={onSearch}
                type="button"
            >
                {loading ? '...' : 'Search'}
            </button>
            {statusText ? <div className={styles.status}>{statusText}</div> : null}

            const parsed = applyBlocks(data.text);
            setResponseText(JSON.stringify(parsed, null, 2));
        } catch (error) {
            setResponseText(`Error: ${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    }, [endpoint, prompt]);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>AI Mode (Ctrl+Shift+A)</div>
            <div className={styles.form}>
                <textarea
                    className={styles.textarea}
                    value={prompt}
                    onChange={onPromptChange}
                />
                <div className={styles.actions}>
                    <button
                        className={styles.button}
                        disabled={loading}
                        onClick={sendPrompt}
                    >
                        {loading ? 'Generating…' : 'Generate script'}
                    </button>
                    <button
                        className={`${styles.button} ${styles.secondary}`}
                        disabled={loading}
                        onClick={clearOutput}
                    >
                        Clear output
                    </button>
                </div>
            </div>
            <pre className={styles.output}>{responseText || 'No response yet.'}</pre>
        </div>
    );
};

AIPanel.propTypes = {
    apiUrl: PropTypes.string
};

AIPanel.defaultProps = {
    apiUrl: ''
    apiUrl: 'http://localhost:3001'
};

export default AIPanel;
